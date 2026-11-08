import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePatients } from "@/api/patients";
import { useTemplates } from "@/api/templates";
import { useCreateTreatmentSession } from "@/api/treatments";
import { PageLayout } from "@/components/layout/page-layout";
import { TemplateMeasuresPreview } from "@/components/treatments/template-measures-preview";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export default function TreatmentCreate() {
  const navigate = useNavigate();
  const { data: patients, isLoading: isLoadingPatients } = usePatients();
  const { data: templates, isLoading: isLoadingTemplates } = useTemplates();
  const createSession = useCreateTreatmentSession();

  const [patientId, setPatientId] = useState<string>("");
  const [templateId, setTemplateId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientId || !templateId) {
      toast.error("Por favor, selecione um paciente e um modelo.");
      return;
    }

    try {
      const newSession = await createSession.mutateAsync({
        patient_id: patientId,
        template_id: templateId,
        status: "active",
        notes: notes || undefined,
      });

      toast.success("Tratamento criado com sucesso!");
      navigate(`/treatments/${newSession.id}`);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar tratamento. Tente novamente.");
    }
  };

  const isLoading = isLoadingPatients || isLoadingTemplates;
  const canSubmit = patientId && templateId && !createSession.isPending;

  return (
    <PageLayout
      title="Novo tratamento"
      description="Escolha o paciente e o modelo que define as medidas acompanhadas na sessão."
    >
      <form onSubmit={handleSubmit} className="flex max-w-3xl flex-col gap-4">
        {/* Patient Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Selecionar paciente</CardTitle>
            <CardDescription>
              Escolha o paciente que receberá o tratamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="patient">Paciente *</Label>
              <Select
                value={patientId}
                onValueChange={setPatientId}
                disabled={isLoading}
              >
                <SelectTrigger id="patient" className="w-full">
                  <SelectValue placeholder="Selecione um paciente..." />
                </SelectTrigger>
                <SelectContent>
                  {patients?.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name} · {patient.species}
                      {patient.breed ? ` (${patient.breed})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Template Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Modelo de tratamento</CardTitle>
            <CardDescription>
              Escolha o modelo que define as medidas a serem monitoradas
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="template">Modelo *</Label>
              <Select
                value={templateId}
                onValueChange={setTemplateId}
                disabled={isLoading}
              >
                <SelectTrigger id="template" className="w-full">
                  <SelectValue placeholder="Selecione um modelo..." />
                </SelectTrigger>
                <SelectContent>
                  {templates?.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                      {template.description && ` · ${template.description}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <TemplateMeasuresPreview templateId={templateId || undefined} />
          </CardContent>
        </Card>

        {/* Notes (Optional) */}
        <Card>
          <CardHeader>
            <CardTitle>Notas</CardTitle>
            <CardDescription>
              Adicione observações sobre este tratamento (opcional)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Adicione informações relevantes sobre o tratamento..."
                rows={4}
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(-1)}
            disabled={createSession.isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="cta" disabled={!canSubmit}>
            {createSession.isPending ? (
              <>
                <Spinner />
                Criando...
              </>
            ) : (
              "Criar tratamento"
            )}
          </Button>
        </div>
      </form>
    </PageLayout>
  );
}
