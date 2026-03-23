import { useParams } from "react-router-dom";
import { usePatient } from "@/api/patients";
import {
  useTreatmentSessions,
  useCreateTreatmentSession,
} from "@/api/treatments";
import { ActiveMonitoringChart } from "@/components/dashboard/active-monitoring-chart";
import { useTemplates } from "@/api/templates";
import { PageLayout } from "@/components/layout/page-layout";
import { TemplateMeasuresPreview } from "@/components/treatments/template-measures-preview";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  IconPlus,
  IconLoader2,
  IconPaw,
  IconChevronDown,
  IconChevronUp,
  IconActivity,
  IconHistory,
} from "@tabler/icons-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  type SortingState,
} from "@tanstack/react-table";
import { columns as treatmentColumns } from "@/pages/treatments/columns";
import { themeAccentClasses } from "@/lib/theme-styles";
import { useState } from "react";
import type { Patient, TreatmentSession } from "@/types";

function NewTreatmentDialog({ patientId }: { patientId: string }) {
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
        <Button size="sm">
          <IconPlus className="mr-2 h-4 w-4" />
          Novo Tratamento
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

function PatientCharacteristicsCard({
  patient,
  collapsed,
  onToggle,
}: {
  patient: Patient;
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`rounded-lg p-2 ${themeAccentClasses.chart1.icon}`}>
            <IconPaw className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Características do Paciente</CardTitle>
            <CardDescription>
              Informações sobre o animal e seu tutor
            </CardDescription>
          </div>
        </div>
        <CardAction>
          <Button variant="ghost" size="icon" onClick={onToggle}>
            {collapsed ? (
              <IconChevronDown className="h-4 w-4" />
            ) : (
              <IconChevronUp className="h-4 w-4" />
            )}
          </Button>
        </CardAction>
      </CardHeader>
      {!collapsed && (
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-muted-foreground">
                Nome
              </span>
              <span>{patient.name}</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-muted-foreground">
                Espécie
              </span>
              <span>{patient.species}</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-muted-foreground">
                Raça
              </span>
              <span>{patient.breed || "-"}</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-muted-foreground">
                Idade
              </span>
              <span>
                {patient.age_years ? `${patient.age_years} anos` : ""}
                {patient.age_years && patient.age_months ? " e " : ""}
                {patient.age_months ? `${patient.age_months} meses` : ""}
                {!patient.age_years && !patient.age_months ? "-" : ""}
              </span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-muted-foreground">
                Peso
              </span>
              <span>{patient.weight_kg ? `${patient.weight_kg} kg` : "-"}</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-muted-foreground">
                Motivo
              </span>
              <span>{patient.motive || "-"}</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-muted-foreground">
                Tutor
              </span>
              <span>
                {patient.owner
                  ? `${patient.owner.first_name} ${patient.owner.last_name}`
                  : "-"}
              </span>
            </div>
          </div>
          {patient.notes && (
            <div className="mt-4 flex flex-col space-y-1">
              <span className="text-sm font-medium text-muted-foreground">
                Notas
              </span>
              <p className="text-sm text-muted-foreground">{patient.notes}</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export default function PatientDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: patient, isLoading: isLoadingPatient } = usePatient(id || "");
  const { data: sessions, isLoading: isLoadingSessions } =
    useTreatmentSessions();
  const [patientInfoCollapsed, setPatientInfoCollapsed] = useState(true);
  const patientSessions = sessions?.filter((s) => s.patient_id === id) || [];
  const currentSessions = patientSessions.filter((s) => !s.completed_at);
  const pastSessions = patientSessions.filter((s) => s.completed_at);

  if (isLoadingPatient || isLoadingSessions) {
    return (
      <PageLayout title="Carregando...">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="h-30 rounded-xl bg-muted/50 animate-pulse" />
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!patient || !id) {
    return (
      <PageLayout title="Paciente não encontrado">
        <div>O paciente solicitado não foi encontrado.</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={`Paciente: ${patient.name}`}
      actions={<NewTreatmentDialog patientId={id} />}
    >
      <div className="space-y-6">
        <PatientCharacteristicsCard
          patient={patient}
          collapsed={patientInfoCollapsed}
          onToggle={() => setPatientInfoCollapsed(!patientInfoCollapsed)}
        />

        {/* Current Treatments */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div
                className={`rounded-lg p-2 ${themeAccentClasses.primary.icon}`}
              >
                <IconActivity className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Tratamentos Atuais</CardTitle>
                <CardDescription>
                  {currentSessions.length}{" "}
                  {currentSessions.length === 1
                    ? "tratamento ativo"
                    : "tratamentos ativos"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {currentSessions.length > 0 ? (
              <TreatmentsTable data={currentSessions} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum tratamento ativo.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div
                className={`rounded-lg p-2 ${themeAccentClasses.chart2.icon}`}
              >
                <IconActivity className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Métricas em Monitoramento</CardTitle>
                <CardDescription>
                  Evolução das medidas numéricas dos tratamentos ativos deste
                  paciente
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ActiveMonitoringChart sessions={currentSessions} />
          </CardContent>
        </Card>

        {/* Past Treatments */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div
                className={`rounded-lg p-2 ${themeAccentClasses.neutral.icon}`}
              >
                <IconHistory className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Tratamentos Passados</CardTitle>
                <CardDescription>
                  {pastSessions.length}{" "}
                  {pastSessions.length === 1
                    ? "tratamento concluído"
                    : "tratamentos concluídos"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {pastSessions.length > 0 ? (
              <TreatmentsTable data={pastSessions} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum tratamento anterior.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
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
        patient: false, // Hide patient column since we are on patient page
      },
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
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
                className="h-24 text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
