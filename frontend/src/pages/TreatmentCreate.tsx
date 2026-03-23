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
import {
  IconPaw,
  IconTemplate,
  IconNotes,
  IconLoader2,
  IconCheck,
} from "@tabler/icons-react";
import { themeAccentClasses } from "@/lib/theme-styles";
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
    <PageLayout title="Novo Tratamento">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Selection */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div
                className={`rounded-lg p-2 ${themeAccentClasses.chart1.icon}`}
              >
                <IconPaw className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Selecionar Paciente</CardTitle>
                <CardDescription>
                  Escolha o paciente que receberá o tratamento
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
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
                      {patient.name} - {patient.species}
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
            <div className="flex items-center gap-3">
              <div
                className={`rounded-lg p-2 ${themeAccentClasses.chart5.icon}`}
              >
                <IconTemplate className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Modelo de Tratamento</CardTitle>
                <CardDescription>
                  Escolha o modelo que define as medidas a serem monitoradas
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
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
                      {template.description && ` - ${template.description}`}
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
            <div className="flex items-center gap-3">
              <div
                className={`rounded-lg p-2 ${themeAccentClasses.chart2.icon}`}
              >
                <IconNotes className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Notas</CardTitle>
                <CardDescription>
                  Adicione observações sobre este tratamento (opcional)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
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
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={createSession.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={!canSubmit} className="min-w-32">
                {createSession.isPending ? (
                  <>
                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <IconCheck className="mr-2 h-4 w-4" />
                    Criar Tratamento
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </PageLayout>
  );
}
