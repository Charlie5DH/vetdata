import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  IconDots,
  IconEdit,
  IconLoader2,
  IconPlus,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";

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
import { Button } from "@/components/ui/button";
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

function patientInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
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
        <Button
          size="sm"
          variant={variant === "primary" ? "default" : "outline"}
          className="h-9 gap-1.5"
        >
          <IconPlus className="size-3.5" />
          Novo tratamento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] sm:max-w-2xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>Novo Tratamento</DialogTitle>
          <DialogDescription>
            Selecione um modelo para iniciar um novo tratamento para este
            paciente.
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto py-4 pr-1">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="template">Modelo de Tratamento</Label>
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
            {createSession.isPending && (
              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Criar Tratamento
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
        <form onSubmit={handleSubmit} className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="edit-patient-name">Nome</Label>
            <Input
              id="edit-patient-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
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
            <div className="grid gap-2">
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
            <div className="grid gap-2">
              <Label htmlFor="edit-patient-age-years">Idade (anos)</Label>
              <Input
                id="edit-patient-age-years"
                type="number"
                min={0}
                value={ageYears}
                onChange={(e) => setAgeYears(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
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
            <div className="grid gap-2">
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
          <div className="grid gap-2">
            <Label htmlFor="edit-patient-motive">Motivo</Label>
            <Input
              id="edit-patient-motive"
              value={motive}
              onChange={(e) => setMotive(e.target.value)}
              placeholder="Opcional"
            />
          </div>
          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updatePatient.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={updatePatient.isPending}>
              {updatePatient.isPending && (
                <IconLoader2 className="mr-2 size-4 animate-spin" />
              )}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PatientHero({ patient }: { patient: Patient }) {
  const [editOpen, setEditOpen] = useState(false);
  const sinceLabel = patient.created_at
    ? `Em atendimento desde ${formatBRDate(patient.created_at)}`
    : null;

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center"
    >
      <div className="grid size-16 shrink-0 place-items-center rounded-full bg-primary/10 text-2xl font-semibold leading-none text-primary">
        {patientInitial(patient.name)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 text-xs uppercase tracking-[0.04em] text-muted-foreground">
          Paciente
        </div>
        <h1 className="mb-1 text-3xl font-semibold tracking-tight text-card-foreground">
          {patient.name}
        </h1>
        {sinceLabel ? (
          <div className="text-sm text-muted-foreground">{sinceLabel}</div>
        ) : null}
      </div>
      <div className="flex shrink-0 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-1.5"
          onClick={() => setEditOpen(true)}
        >
          <IconEdit className="size-3.5" />
          Editar
        </Button>
        <NewTreatmentDialog patientId={patient.id} />
      </div>
      <EditPatientDialog
        patient={patient}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </motion.header>
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
    <div className="mb-4">
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <h2 className="text-xl font-semibold tracking-tight text-card-foreground">
            {title}
          </h2>
          {count ? (
            <span className="text-xs tracking-[0.02em] text-muted-foreground">
              {count}
            </span>
          ) : null}
        </div>
        {action}
      </div>
      {description ? (
        <p className="mt-1 max-w-[60ch] text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
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
      value: patient.weight_kg ? `${patient.weight_kg} kg` : "—",
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
    <section className="mt-10">
      <SectionHeader
        title="Características"
        description="Informações sobre o animal e seu tutor."
      />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden rounded-[14px] border border-border bg-card px-2 py-1"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item.label} className="flex flex-col gap-1 px-4 py-4">
              <span className="text-[11.5px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
                {item.label}
              </span>
              <span
                className={
                  item.dim
                    ? "text-sm text-muted-foreground"
                    : "text-sm text-card-foreground"
                }
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function NotesSection({ patient }: { patient: Patient }) {
  return (
    <section className="mt-10">
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
    <div className="rounded-[14px] border border-border bg-card p-5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="text-[11.5px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
          {label}
        </div>
        {!editing ? (
          <button
            type="button"
            onClick={startEditing}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <IconEdit className="size-3.5" />
            {isEmpty ? "Adicionar" : "Editar"}
          </button>
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
              {updatePatient.isPending && (
                <IconLoader2 className="mr-2 size-3.5 animate-spin" />
              )}
              Salvar
            </Button>
          </div>
        </div>
      ) : isEmpty ? (
        <button
          type="button"
          onClick={startEditing}
          className="-mx-1 -my-1 flex w-full rounded-md px-1 py-1 text-left text-sm italic text-muted-foreground transition-colors hover:bg-secondary/60"
        >
          {placeholder}
        </button>
      ) : (
        <p className="whitespace-pre-wrap text-sm leading-[1.6] text-card-foreground">
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
    <section className="mt-10">
      <SectionHeader
        title="Vacinas"
        count={countLabel}
        action={
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5"
            onClick={() => setCreateOpen(true)}
          >
            <IconPlus className="size-3.5" />
            Adicionar vacina
          </Button>
        }
      />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden rounded-[14px] border border-border bg-card"
      >
        {isLoading ? (
          <div className="px-6 py-8 text-sm text-muted-foreground">
            Carregando…
          </div>
        ) : total > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <ColHead>Vacina</ColHead>
                <ColHead>Dose</ColHead>
                <ColHead>Aplicada em</ColHead>
                <ColHead>Próximo reforço</ColHead>
                <ColHead>Lote</ColHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {vaccinations!.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium text-card-foreground">
                    {v.vaccine?.name ?? "—"}
                  </TableCell>
                  <Cell dim={v.dose_number == null}>
                    {v.dose_number ?? "—"}
                  </Cell>
                  <Cell>{formatBRDate(v.applied_at)}</Cell>
                  <Cell dim={!v.next_due_at}>
                    {v.next_due_at ? (
                      <span
                        className={
                          v.is_overdue ? "font-medium text-destructive" : ""
                        }
                      >
                        {formatBRDate(v.next_due_at)}
                        {v.is_overdue ? " (atrasada)" : ""}
                      </span>
                    ) : (
                      "—"
                    )}
                  </Cell>
                  <Cell dim={!v.batch}>{v.batch ?? "—"}</Cell>
                  <TableCell className="text-right">
                    <button
                      type="button"
                      onClick={() => setEditing(v)}
                      aria-label="Mais ações"
                      className="inline-grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <IconDots className="size-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyMini message="Nenhuma vacina registrada para este paciente." />
        )}
      </motion.div>
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
    <section className="mt-10">
      <SectionHeader
        title="Tratamentos atuais"
        count={countLabel}
        action={
          total > 0 ? (
            <Button variant="ghost" size="sm" className="h-8">
              Ver histórico
            </Button>
          ) : undefined
        }
      />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden rounded-[14px] border border-border bg-card"
      >
        {total > 0 ? (
          <TreatmentsTable data={sessions} />
        ) : (
          <EmptyMini message="Nenhum tratamento ativo no momento." />
        )}
      </motion.div>
    </section>
  );
}

function MonitoringSection({ sessions }: { sessions: TreatmentSession[] }) {
  return (
    <section className="mt-10">
      <SectionHeader
        title="Métricas em monitoramento"
        description="Evolução das medidas numéricas dos tratamentos ativos deste paciente."
      />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden rounded-[14px] border border-border bg-card p-4 sm:p-5"
      >
        <ActiveMonitoringChart sessions={sessions} />
      </motion.div>
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

  return (
    <section className="mt-10">
      <SectionHeader title="Tratamentos passados" count={countLabel} />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden rounded-[14px] border border-border bg-card"
      >
        {total > 0 ? (
          <TreatmentsTable data={sessions} />
        ) : (
          <EmptyMini message="Nenhum tratamento concluído ainda. Quando o atendimento atual for finalizado, ele aparecerá aqui." />
        )}
      </motion.div>
    </section>
  );
}

function ColHead({ children }: { children: React.ReactNode }) {
  return (
    <TableHead className="text-[11.5px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
      {children}
    </TableHead>
  );
}

function Cell({
  children,
  dim,
}: {
  children: React.ReactNode;
  dim?: boolean;
}) {
  return (
    <TableCell className={dim ? "text-muted-foreground" : undefined}>
      {children}
    </TableCell>
  );
}

function EmptyMini({ message }: { message: string }) {
  return (
    <div className="px-6 py-6 text-center text-sm text-muted-foreground">
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
              <TableHead
                key={header.id}
                className="text-[11.5px] font-medium uppercase tracking-[0.06em] text-muted-foreground"
              >
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

  if (isLoadingPatient || isLoadingSessions) {
    return (
      <PageLayout>
        <div className="mx-auto w-full max-w-270">
          <div className="flex h-40 items-center justify-center">
            <IconLoader2 className="size-6 animate-spin text-muted-foreground" />
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
        <PatientHero patient={patient} />
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
