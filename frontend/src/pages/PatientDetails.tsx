import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";

import { useSessionsAlerts } from "@/api/alerts";
import { usePatient, useUpdatePatient } from "@/api/patients";
import { usePatientVaccinations } from "@/api/vaccines";
import {
  useTreatmentSessions,
  useCreateTreatmentSession,
} from "@/api/treatments";
import { useTemplates } from "@/api/templates";
import { ActiveMonitoringChart } from "@/components/dashboard/active-monitoring-chart";
import { TemplateMeasuresPreview } from "@/components/treatments/template-measures-preview";
import { VaccineRecordDialog } from "@/components/vaccines/vaccine-record-dialog";
import { PageLayout } from "@/components/layout/page-layout";
import {
  AlertIcon,
  CalendarIcon,
  ClockIcon,
  EditIcon,
  MoreIcon,
  OwnerIcon,
  PlusIcon,
  ScaleIcon,
  StethoscopeIcon,
} from "@/components/icons/vetdata-icons";
import { SpeciesIcon } from "@/components/patients/pet-avatar";
import { formatWeight, ownerFullName } from "@/components/patients/patient-format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { columns as treatmentColumns } from "@/pages/treatments/columns";
import type {
  Alert,
  Patient,
  PatientCreate,
  PatientVaccination,
  TreatmentSession,
} from "@/types";

const SPECIES_OPTIONS = [
  "Cachorro",
  "Gato",
  "Cavalo",
  "Pássaro",
  "Outro",
] as const;

function patientToUpdatePayload(
  patient: Patient,
  overrides: Partial<PatientCreate> = {},
): PatientCreate {
  return {
    name: patient.name,
    species: patient.species,
    breed: patient.breed ?? null,
    age_years: patient.age_years ?? 0,
    age_months: patient.age_months ?? 0,
    weight_kg: patient.weight_kg ?? 0,
    notes: patient.notes ?? null,
    motive: patient.motive ?? null,
    vaccine_notes: patient.vaccine_notes ?? null,
    owner_id: patient.owner_id,
    ...overrides,
  };
}

function formatBRDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-BR");
}

function formatAge(years?: number | null, months?: number | null): string {
  if (!years && !months) return "—";
  const parts: string[] = [];
  if (years) parts.push(`${years} ${years === 1 ? "ano" : "anos"}`);
  if (months) parts.push(`${months} ${months === 1 ? "mês" : "meses"}`);
  return parts.join(" e ");
}

function formatTimelineDay(value: string) {
  return new Date(value)
    .toLocaleDateString("pt-BR", { day: "numeric", month: "short" })
    .replace(" de ", " ");
}

function NewTreatmentDialog({
  patientId,
  variant = "primary",
}: {
  patientId: string;
  variant?: "primary" | "secondary";
}) {
  const [open, setOpen] = useState(false);
  const [templateId, setTemplateId] = useState<string>("");
  const { data: templates } = useTemplates();
  const createSession = useCreateTreatmentSession();

  const handleSubmit = async () => {
    if (!templateId) return;

    try {
      await createSession.mutateAsync({
        patient_id: patientId,
        template_id: templateId,
        status: "active",
      });
      toast.success("Tratamento criado com sucesso!");
      setOpen(false);
      setTemplateId("");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar tratamento.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant === "primary" ? "cta" : "outline"}>
          <PlusIcon />
          Novo tratamento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] sm:max-w-2xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>Novo tratamento</DialogTitle>
          <DialogDescription>
            Selecione um modelo para iniciar um novo tratamento para este
            paciente.
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto pr-1">
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="template">Modelo de tratamento</Label>
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger id="template">
                  <SelectValue placeholder="Selecione um modelo..." />
                </SelectTrigger>
                <SelectContent>
                  {templates?.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <TemplateMeasuresPreview templateId={templateId || undefined} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!templateId || createSession.isPending}
          >
            {createSession.isPending && <Spinner />}
            Criar tratamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditPatientDialog({
  patient,
  open,
  onOpenChange,
}: {
  patient: Patient;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updatePatient = useUpdatePatient();
  const [name, setName] = useState(patient.name);
  const [species, setSpecies] = useState(patient.species);
  const [breed, setBreed] = useState(patient.breed ?? "");
  const [ageYears, setAgeYears] = useState(
    patient.age_years != null ? String(patient.age_years) : "",
  );
  const [ageMonths, setAgeMonths] = useState(
    patient.age_months != null ? String(patient.age_months) : "",
  );
  const [weightKg, setWeightKg] = useState(
    patient.weight_kg != null ? String(patient.weight_kg) : "",
  );
  const [motive, setMotive] = useState(patient.motive ?? "");

  // Sync state when dialog opens for a different patient or after save.
  useEffect(() => {
    if (!open) return;
    setName(patient.name);
    setSpecies(patient.species);
    setBreed(patient.breed ?? "");
    setAgeYears(patient.age_years != null ? String(patient.age_years) : "");
    setAgeMonths(patient.age_months != null ? String(patient.age_months) : "");
    setWeightKg(patient.weight_kg != null ? String(patient.weight_kg) : "");
    setMotive(patient.motive ?? "");
  }, [open, patient]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      toast.error("Informe o nome do paciente.");
      return;
    }
    if (!species) {
      toast.error("Informe a espécie.");
      return;
    }

    try {
      await updatePatient.mutateAsync({
        id: patient.id,
        ...patientToUpdatePayload(patient, {
          name: name.trim(),
          species,
          breed: breed.trim() || null,
          age_years: ageYears ? Number(ageYears) : 0,
          age_months: ageMonths ? Number(ageMonths) : 0,
          weight_kg: weightKg ? Number(weightKg) : 0,
          motive: motive.trim() || null,
        }),
      });
      toast.success("Paciente atualizado.");
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar o paciente.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar paciente</DialogTitle>
          <DialogDescription>
            Atualize as informações principais do paciente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="edit-patient-name">Nome</Label>
            <Input
              id="edit-patient-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="edit-patient-species">Espécie</Label>
              <Select value={species} onValueChange={setSpecies}>
                <SelectTrigger id="edit-patient-species">
                  <SelectValue placeholder="Selecione a espécie" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIES_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-patient-breed">Raça</Label>
              <Input
                id="edit-patient-breed"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                placeholder="Opcional"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="edit-patient-age-years">Idade (anos)</Label>
              <Input
                id="edit-patient-age-years"
                type="number"
                min={0}
                value={ageYears}
                onChange={(e) => setAgeYears(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-patient-age-months">Meses</Label>
              <Input
                id="edit-patient-age-months"
                type="number"
                min={0}
                max={11}
                value={ageMonths}
                onChange={(e) => setAgeMonths(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-patient-weight">Peso (kg)</Label>
              <Input
                id="edit-patient-weight"
                type="number"
                step="0.1"
                min={0}
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="edit-patient-motive">Motivo</Label>
            <Input
              id="edit-patient-motive"
              value={motive}
              onChange={(e) => setMotive(e.target.value)}
              placeholder="Opcional"
            />
          </div>
          <DialogFooter className="mt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updatePatient.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={updatePatient.isPending}>
              {updatePatient.isPending && <Spinner />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PatientHero({
  patient,
  inTreatment,
  alerts,
}: {
  patient: Patient;
  inTreatment: boolean;
  alerts: Alert[];
}) {
  const [editOpen, setEditOpen] = useState(false);
  const sinceLabel = patient.created_at
    ? `Em atendimento desde ${formatBRDate(patient.created_at)}`
    : null;
  const weight = formatWeight(patient.weight_kg);
  const owner = ownerFullName(patient.owner);
  const signalment = [patient.species, patient.breed]
    .filter(Boolean)
    .join(" · ");

  return (
    <header className="grid grid-cols-[auto_1fr] items-start gap-x-5 gap-y-4 lg:grid-cols-[auto_1fr_auto] lg:items-center">
      <div className="relative grid size-[72px] shrink-0 place-items-center rounded-full bg-mint-300 text-foreground">
        <SpeciesIcon species={patient.species} size={34} strokeWidth={1.5} />
        <span className="absolute -right-0.5 -bottom-0.5 grid size-[26px] place-items-center rounded-full border border-border bg-card ring-2 ring-card">
          <SpeciesIcon species={patient.species} size={14} />
        </span>
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl font-semibold text-foreground">
            {patient.name}
          </h1>
          {inTreatment ? (
            <Badge variant="info">
              <span aria-hidden className="size-1.5 rounded-full bg-current" />
              Em tratamento
            </Badge>
          ) : (
            <Badge variant="secondary">Sem tratamento ativo</Badge>
          )}
        </div>
        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1.5 text-[13.5px] text-muted-foreground [&_svg]:shrink-0">
          {signalment ? <span>{signalment}</span> : null}
          <span className="inline-flex items-center gap-1.5">
            <CalendarIcon size={14} />
            <span className="font-medium text-foreground">
              {formatAge(patient.age_years, patient.age_months)}
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ScaleIcon size={14} />
            {weight ? (
              <span className="font-medium text-foreground tabular-nums">
                {weight} kg
              </span>
            ) : (
              "—"
            )}
          </span>
          {owner ? (
            <span className="inline-flex items-center gap-1.5">
              <OwnerIcon size={14} />
              {owner}
            </span>
          ) : null}
          {sinceLabel ? (
            <span className="inline-flex items-center gap-1.5">
              <ClockIcon size={14} />
              {sinceLabel}
            </span>
          ) : null}
        </div>
        {alerts.length > 0 ? (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {alerts.map((alert) => (
              <span
                key={alert.id}
                title={alert.message}
                className="inline-flex h-[26px] items-center gap-1.5 rounded-md bg-destructive-soft px-2.5 text-[12.5px] font-semibold text-destructive"
              >
                <AlertIcon size={13} />
                {alert.measure?.name || "Medida"}{" "}
                {alert.threshold_type === "lower"
                  ? "abaixo do limite"
                  : "acima do limite"}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="col-span-2 flex shrink-0 gap-2 lg:col-span-1">
        <Button variant="outline" onClick={() => setEditOpen(true)}>
          <EditIcon />
          Editar
        </Button>
        <NewTreatmentDialog patientId={patient.id} />
      </div>
      <EditPatientDialog
        patient={patient}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </header>
  );
}

function SectionHeader({
  title,
  count,
  description,
  action,
}: {
  title: string;
  count?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-baseline gap-2.5">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          {count ? (
            <span className="text-xs text-muted-foreground tabular-nums">
              {count}
            </span>
          ) : null}
        </div>
        {description ? (
          <p className="mt-0.5 max-w-[60ch] text-[13px] text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

function CharacteristicsSection({ patient }: { patient: Patient }) {
  const items: { label: string; value: string; dim?: boolean }[] = [
    { label: "Espécie", value: patient.species || "—", dim: !patient.species },
    { label: "Raça", value: patient.breed || "—", dim: !patient.breed },
    {
      label: "Idade",
      value: formatAge(patient.age_years, patient.age_months),
      dim: !patient.age_years && !patient.age_months,
    },
    {
      label: "Peso atual",
      value: patient.weight_kg ? `${formatWeight(patient.weight_kg)} kg` : "—",
      dim: !patient.weight_kg,
    },
    {
      label: "Motivo",
      value: patient.motive || "Não informado",
      dim: !patient.motive,
    },
    {
      label: "Tutor",
      value: patient.owner
        ? `${patient.owner.first_name} ${patient.owner.last_name}`
        : "—",
      dim: !patient.owner,
    },
    {
      label: "Telefone do tutor",
      value: patient.owner?.phone || "Não informado",
      dim: !patient.owner?.phone,
    },
    {
      label: "E-mail do tutor",
      value: patient.owner?.email || "—",
      dim: !patient.owner?.email,
    },
  ];

  return (
    <section className="mt-8">
      <SectionHeader
        title="Características"
        description="Informações sobre o animal e seu tutor."
      />
      <div className="rounded-xl border border-border bg-card px-5 py-2.5">
        <dl className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-baseline justify-between gap-4 py-2.5"
            >
              <dt className="shrink-0 text-[13px] text-muted-foreground">
                {item.label}
              </dt>
              <dd
                className={
                  item.dim
                    ? "text-right text-sm text-muted-foreground"
                    : "text-right text-sm font-medium text-foreground"
                }
              >
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function NotesSection({ patient }: { patient: Patient }) {
  return (
    <section className="mt-8">
      <SectionHeader
        title="Notas"
        description="Anotações livres sobre o paciente e histórico de vacinas."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <EditableNoteCard
          patient={patient}
          field="notes"
          label="Notas gerais"
          placeholder="Adicione notas sobre o paciente, comportamento, observações clínicas…"
        />
        <EditableNoteCard
          patient={patient}
          field="vaccine_notes"
          label="Histórico de vacinas"
          placeholder="Anote o histórico vacinal observado fora desta clínica, por exemplo."
        />
      </div>
    </section>
  );
}

function EditableNoteCard({
  patient,
  field,
  label,
  placeholder,
}: {
  patient: Patient;
  field: "notes" | "vaccine_notes";
  label: string;
  placeholder: string;
}) {
  const initialValue = patient[field] ?? "";
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const updatePatient = useUpdatePatient();

  // Reset draft when underlying value changes (after a successful save).
  useEffect(() => {
    if (!editing) setValue(initialValue);
  }, [initialValue, editing]);

  const startEditing = () => {
    setValue(initialValue);
    setEditing(true);
  };

  const cancel = () => {
    setValue(initialValue);
    setEditing(false);
  };

  const save = async () => {
    const next = value.trim();
    if (next === (initialValue ?? "")) {
      setEditing(false);
      return;
    }
    try {
      await updatePatient.mutateAsync({
        id: patient.id,
        ...patientToUpdatePayload(patient, { [field]: next || null }),
      });
      toast.success("Notas atualizadas.");
      setEditing(false);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar as notas.");
    }
  };

  const isEmpty = !initialValue;

  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-card p-5">
      <div className="flex min-h-[26px] items-center justify-between gap-2">
        <div className="text-[13px] font-semibold text-foreground">{label}</div>
        {!editing ? (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={startEditing}
            className="text-muted-foreground"
          >
            <EditIcon />
            {isEmpty ? "Adicionar" : "Editar"}
          </Button>
        ) : null}
      </div>
      {editing ? (
        <div className="space-y-2">
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            rows={5}
            autoFocus
            disabled={updatePatient.isPending}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={cancel}
              disabled={updatePatient.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={save}
              disabled={updatePatient.isPending}
            >
              {updatePatient.isPending && <Spinner />}
              Salvar
            </Button>
          </div>
        </div>
      ) : isEmpty ? (
        <button
          type="button"
          onClick={startEditing}
          className="-mx-2 -my-1 flex rounded-md px-2 py-1 text-left text-sm text-muted-foreground transition-colors hover:bg-muted"
        >
          {placeholder}
        </button>
      ) : (
        <p className="whitespace-pre-wrap text-sm leading-[1.6] text-stone-700">
          {initialValue}
        </p>
      )}
    </div>
  );
}

function VaccinationsSection({ patientId }: { patientId: string }) {
  const { data: vaccinations, isLoading } = usePatientVaccinations(patientId);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<PatientVaccination | null>(null);
  const total = vaccinations?.length ?? 0;
  const countLabel = total === 1 ? "1 registro" : `${total} registros`;

  return (
    <section className="mt-8">
      <SectionHeader
        title="Vacinas"
        count={countLabel}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCreateOpen(true)}
          >
            <PlusIcon />
            Adicionar vacina
          </Button>
        }
      />
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {isLoading ? (
          <div className="px-6 py-8 text-sm text-muted-foreground">
            Carregando…
          </div>
        ) : total > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Vacina</TableHead>
                <TableHead className="text-right">Dose</TableHead>
                <TableHead>Aplicada em</TableHead>
                <TableHead>Próximo reforço</TableHead>
                <TableHead>Lote</TableHead>
                <TableHead className="w-14" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {vaccinations!.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-semibold text-foreground">
                    {v.vaccine?.name ?? "—"}
                  </TableCell>
                  <Cell dim={v.dose_number == null} className="text-right">
                    {v.dose_number ?? "—"}
                  </Cell>
                  <Cell>{formatBRDate(v.applied_at)}</Cell>
                  <Cell dim={!v.next_due_at}>
                    {v.next_due_at ? (
                      <span
                        className={
                          v.is_overdue ? "font-semibold text-destructive" : ""
                        }
                      >
                        {formatBRDate(v.next_due_at)}
                        {v.is_overdue ? " (atrasada)" : ""}
                      </span>
                    ) : (
                      "—"
                    )}
                  </Cell>
                  <Cell dim={!v.batch} className="font-mono text-xs">
                    {v.batch ?? "—"}
                  </Cell>
                  <TableCell className="w-14 pl-0 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setEditing(v)}
                      aria-label="Mais ações"
                      className="text-muted-foreground"
                    >
                      <MoreIcon />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyMini message="Nenhuma vacina registrada para este paciente." />
        )}
      </div>
      <VaccineRecordDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        fixedPatientId={patientId}
      />
      <VaccineRecordDialog
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        vaccination={editing}
        fixedPatientId={patientId}
      />
    </section>
  );
}

function CurrentTreatmentsSection({
  sessions,
}: {
  sessions: TreatmentSession[];
}) {
  const total = sessions.length;
  const countLabel = total === 1 ? "1 ativo" : `${total} ativos`;

  return (
    <section className="mt-8">
      <SectionHeader
        title="Tratamentos atuais"
        count={countLabel}
        action={
          total > 0 ? (
            <Button variant="ghost" size="sm">
              Ver histórico
            </Button>
          ) : undefined
        }
      />
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {total > 0 ? (
          <TreatmentsTable data={sessions} />
        ) : (
          <EmptyMini message="Nenhum tratamento ativo no momento." />
        )}
      </div>
    </section>
  );
}

function MonitoringSection({ sessions }: { sessions: TreatmentSession[] }) {
  return (
    <section className="mt-8">
      <SectionHeader
        title="Métricas em monitoramento"
        description="Evolução das medidas numéricas dos tratamentos ativos deste paciente."
      />
      <div className="overflow-hidden rounded-xl border border-border bg-card p-5">
        <ActiveMonitoringChart sessions={sessions} />
      </div>
    </section>
  );
}

function PastTreatmentsSection({
  sessions,
}: {
  sessions: TreatmentSession[];
}) {
  const total = sessions.length;
  const countLabel = total === 1 ? "1 concluído" : `${total} concluídos`;
  const ordered = [...sessions].sort(
    (a, b) =>
      new Date(b.completed_at ?? b.started_at).getTime() -
      new Date(a.completed_at ?? a.started_at).getTime(),
  );

  return (
    <section className="mt-8">
      <SectionHeader title="Tratamentos passados" count={countLabel} />
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {total > 0 ? (
          <ol className="px-5 pt-5">
            {ordered.map((session, index) => {
              const endedAt = session.completed_at ?? session.started_at;
              const logCount = session.logs?.length ?? 0;
              const isLast = index === ordered.length - 1;

              return (
                <li
                  key={session.id}
                  className="grid grid-cols-[72px_32px_1fr] gap-x-3.5"
                >
                  <div className="pt-1.5 text-right text-[12.5px] text-muted-foreground tabular-nums">
                    <span className="block text-[13px] font-semibold text-foreground">
                      {formatTimelineDay(endedAt)}
                    </span>
                    {new Date(endedAt).getFullYear()}
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full border border-border bg-muted text-foreground">
                      <StethoscopeIcon size={16} />
                    </span>
                    {!isLast ? (
                      <span className="my-1 w-px flex-1 bg-input" />
                    ) : null}
                  </div>
                  <div className="flex min-w-0 flex-col gap-1 pt-[5px] pb-[22px]">
                    <Link
                      to={`/treatments/${session.id}`}
                      className="text-[14.5px] font-semibold text-foreground hover:underline"
                    >
                      {session.template?.name || "Tratamento"}
                    </Link>
                    {session.notes ? (
                      <p className="text-[13.5px] text-stone-700">
                        {session.notes}
                      </p>
                    ) : null}
                    <span className="text-[12.5px] text-muted-foreground tabular-nums">
                      {formatBRDate(session.started_at)} –{" "}
                      {formatBRDate(session.completed_at)} ·{" "}
                      {logCount === 1 ? "1 registro" : `${logCount} registros`}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <EmptyMini message="Nenhum tratamento concluído ainda. Quando o atendimento atual for finalizado, ele aparecerá aqui." />
        )}
      </div>
    </section>
  );
}

function Cell({
  children,
  dim,
  className,
}: {
  children: React.ReactNode;
  dim?: boolean;
  className?: string;
}) {
  return (
    <TableCell
      className={[dim ? "text-muted-foreground" : "", "tabular-nums", className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </TableCell>
  );
}

function EmptyMini({ message }: { message: string }) {
  return (
    <div className="px-6 py-8 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function TreatmentsTable({ data }: { data: TreatmentSession[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns: treatmentColumns,
    state: {
      sorting,
      columnVisibility: {
        patient: false,
      },
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} className="hover:bg-transparent">
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={treatmentColumns.length}
              className="h-24 text-center text-sm text-muted-foreground"
            >
              Sem resultados.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export default function PatientDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: patient, isLoading: isLoadingPatient } = usePatient(id || "");
  const { data: sessions, isLoading: isLoadingSessions } =
    useTreatmentSessions();

  const patientSessions = sessions?.filter((s) => s.patient_id === id) || [];
  const currentSessions = patientSessions.filter((s) => !s.completed_at);
  const pastSessions = patientSessions.filter((s) => s.completed_at);

  const currentSessionIds = useMemo(
    () =>
      (sessions ?? [])
        .filter((s) => s.patient_id === id && !s.completed_at)
        .map((s) => s.id),
    [sessions, id],
  );
  const { data: sessionAlerts } = useSessionsAlerts(currentSessionIds);
  // One flag per measure and direction, newest first.
  const activeAlerts = useMemo(() => {
    const seen = new Set<string>();
    return [...sessionAlerts]
      .filter((alert) => alert.status === "active")
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .filter((alert) => {
        const key = `${alert.measure_id}:${alert.threshold_type}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [sessionAlerts]);

  if (isLoadingPatient || isLoadingSessions) {
    return (
      <PageLayout>
        <div className="mx-auto w-full max-w-270">
          <div className="flex h-40 items-center justify-center">
            <Spinner className="size-6 text-muted-foreground" />
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!patient || !id) {
    return (
      <PageLayout>
        <div className="mx-auto w-full max-w-270">
          <div className="text-sm text-muted-foreground">
            O paciente solicitado não foi encontrado.
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="mx-auto w-full max-w-270">
        <PatientHero
          patient={patient}
          inTreatment={currentSessions.length > 0}
          alerts={activeAlerts}
        />
        <CharacteristicsSection patient={patient} />
        <NotesSection patient={patient} />
        <VaccinationsSection patientId={id} />
        <CurrentTreatmentsSection sessions={currentSessions} />
        <MonitoringSection sessions={currentSessions} />
        <PastTreatmentsSection sessions={pastSessions} />
      </div>
    </PageLayout>
  );
}
