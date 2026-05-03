import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  useCreateVaccination,
  useUpdateVaccination,
  useVaccineCatalog,
} from "@/api/vaccines";
import { usePatients } from "@/api/patients";
import { speciesMatches } from "@/lib/species";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { PatientVaccination } from "@/types";

interface VaccineRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, dialog is in edit mode. */
  vaccination?: PatientVaccination | null;
  /** When provided, locks the patient field. */
  fixedPatientId?: string;
  /** Optional pre-selected vaccine (used when "Add vaccine" is launched from a specific catalog row). */
  initialVaccineId?: string;
}

function toLocalInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function fromLocalInput(value: string) {
  if (!value) return null;
  return new Date(value).toISOString();
}

export function VaccineRecordDialog({
  open,
  onOpenChange,
  vaccination,
  fixedPatientId,
  initialVaccineId,
}: VaccineRecordDialogProps) {
  const isEdit = Boolean(vaccination);
  const { data: patients } = usePatients();
  const { data: catalog } = useVaccineCatalog();
  const createVaccination = useCreateVaccination();
  const updateVaccination = useUpdateVaccination();

  const [patientId, setPatientId] = useState(fixedPatientId ?? "");
  const [vaccineId, setVaccineId] = useState(initialVaccineId ?? "");
  const [appliedAt, setAppliedAt] = useState("");
  const [doseNumber, setDoseNumber] = useState("");
  const [batch, setBatch] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [nextDueAt, setNextDueAt] = useState("");
  const [appliedBy, setAppliedBy] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("applied");

  useEffect(() => {
    if (!open) return;
    if (vaccination) {
      setPatientId(vaccination.patient_id);
      setVaccineId(vaccination.vaccine_id);
      setAppliedAt(toLocalInput(vaccination.applied_at));
      setDoseNumber(vaccination.dose_number?.toString() ?? "");
      setBatch(vaccination.batch ?? "");
      setManufacturer(vaccination.manufacturer ?? "");
      setNextDueAt(toLocalInput(vaccination.next_due_at));
      setAppliedBy(vaccination.applied_by ?? "");
      setNotes(vaccination.notes ?? "");
      setStatus(vaccination.status ?? "applied");
    } else {
      setPatientId(fixedPatientId ?? "");
      setVaccineId(initialVaccineId ?? "");
      setAppliedAt(toLocalInput(new Date().toISOString()));
      setDoseNumber("");
      setBatch("");
      setManufacturer("");
      setNextDueAt("");
      setAppliedBy("");
      setNotes("");
      setStatus("applied");
    }
  }, [open, vaccination, fixedPatientId, initialVaccineId]);

  const selectedPatient = patients?.find((p) => p.id === patientId);
  const filteredCatalog = useMemo(() => {
    if (!catalog) return [];
    if (!selectedPatient) return catalog;
    return catalog.filter((v) => speciesMatches(v.species, selectedPatient.species));
  }, [catalog, selectedPatient]);
  const selectedVaccine = catalog?.find((v) => v.id === vaccineId);

  // Auto-suggest next_due_at when vaccine + applied_at are set and next_due is empty
  useEffect(() => {
    if (!selectedVaccine || !appliedAt || nextDueAt) return;
    const interval = selectedVaccine.booster_interval_days;
    if (!interval) return;
    const applied = new Date(appliedAt);
    if (Number.isNaN(applied.getTime())) return;
    const next = new Date(applied);
    next.setDate(next.getDate() + interval);
    setNextDueAt(toLocalInput(next.toISOString()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVaccine, appliedAt]);

  const isPending = createVaccination.isPending || updateVaccination.isPending;
  const canSubmit = Boolean(patientId && vaccineId && appliedAt) && !isPending;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const appliedIso = fromLocalInput(appliedAt);
    if (!appliedIso) {
      toast.error("Data de aplicação inválida.");
      return;
    }
    const payload = {
      vaccine_id: vaccineId,
      applied_at: appliedIso,
      dose_number: doseNumber.trim() ? Number(doseNumber) : null,
      batch: batch.trim() || null,
      manufacturer: manufacturer.trim() || null,
      next_due_at: fromLocalInput(nextDueAt),
      applied_by: appliedBy.trim() || null,
      notes: notes.trim() || null,
      status,
    };
    try {
      if (isEdit && vaccination) {
        await updateVaccination.mutateAsync({ id: vaccination.id, ...payload });
        toast.success("Vacinação atualizada.");
      } else {
        await createVaccination.mutateAsync({
          patient_id: patientId,
          ...payload,
        });
        toast.success("Vacinação registrada.");
      }
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível salvar a vacinação.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar vacinação" : "Nova vacinação"}</DialogTitle>
          <DialogDescription>
            Registre a aplicação da vacina, lote e próximo reforço.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="patient">Paciente*</Label>
            <Select
              value={patientId}
              onValueChange={setPatientId}
              disabled={Boolean(fixedPatientId) || isEdit}
            >
              <SelectTrigger id="patient">
                <SelectValue placeholder="Selecione um paciente..." />
              </SelectTrigger>
              <SelectContent>
                {patients?.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} — {p.species}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vaccine">Vacina*</Label>
            <Select value={vaccineId} onValueChange={setVaccineId}>
              <SelectTrigger id="vaccine">
                <SelectValue placeholder="Selecione uma vacina..." />
              </SelectTrigger>
              <SelectContent>
                {filteredCatalog.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedVaccine?.diseases?.length ? (
              <p className="text-xs text-muted-foreground">
                Cobertura: {selectedVaccine.diseases.join(", ")}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="applied_at">Data de aplicação*</Label>
              <Input
                id="applied_at"
                type="datetime-local"
                value={appliedAt}
                onChange={(e) => setAppliedAt(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="next_due_at">Próximo reforço</Label>
              <Input
                id="next_due_at"
                type="datetime-local"
                value={nextDueAt}
                onChange={(e) => setNextDueAt(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="dose_number">Dose nº</Label>
              <Input
                id="dose_number"
                type="number"
                min={1}
                value={doseNumber}
                onChange={(e) => setDoseNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="batch">Lote</Label>
              <Input
                id="batch"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Fabricante</Label>
              <Input
                id="manufacturer"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="applied_by">Aplicado por</Label>
              <Input
                id="applied_by"
                value={appliedBy}
                onChange={(e) => setAppliedBy(e.target.value)}
                placeholder="Nome do veterinário"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="applied">Aplicada</SelectItem>
                  <SelectItem value="scheduled">Agendada</SelectItem>
                  <SelectItem value="skipped">Não aplicada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isEdit ? "Salvar alterações" : "Registrar vacina"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
