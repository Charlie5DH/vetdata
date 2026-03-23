import { useParams } from "react-router-dom";
import { useState, type MouseEvent } from "react";
import { useSessionAlerts } from "@/api/alerts";
import {
  useTreatmentSession,
  useCreateTreatmentLog,
  useDeleteTreatmentLog,
} from "@/api/treatments";
import { PageLayout } from "@/components/layout/page-layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  IconPlus,
  IconCheck,
  IconX,
  IconLoader2,
  IconChevronDown,
  IconChevronUp,
  IconTrash,
  IconInfoCircle,
  IconRulerMeasure,
  IconTimeline,
  IconTable,
  IconChartLine,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { toast } from "sonner";
import type { Measure, TreatmentLog } from "@/types";
import { TreatmentChart } from "@/components/TreatmentChart";
import { themeAccentClasses } from "@/lib/theme-styles";

type Thresholds = {
  lower: number | null;
  upper: number | null;
};

function hasMeasure<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

type LogRowProps = {
  isDeleting: boolean;
  log: TreatmentLog;
  measures: Measure[];
  onDelete: (logId: string, event: MouseEvent<HTMLButtonElement>) => void;
};

type LogListRowProps = LogRowProps & {
  isExpanded: boolean;
  onToggle: (logId: string) => void;
};

type AddLogFormProps = {
  measures: Measure[];
  newLogDate: string;
  newLogNotes: string;
  newLogValues: Record<string, string>;
  isSaving: boolean;
  onDateChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onValueChange: (measureId: string, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

function getOptions(measure: Measure) {
  if (!measure.options) {
    return [];
  }

  if (Array.isArray(measure.options)) {
    return measure.options;
  }

  if (typeof measure.options === "string") {
    try {
      return JSON.parse(measure.options);
    } catch {
      return [];
    }
  }

  return [];
}

function getSessionStatusLabel(status?: string | null) {
  switch (status) {
    case "active":
      return "Ativo";
    case "completed":
      return "Concluído";
    default:
      return status || "-";
  }
}

function SessionAlertsCard({
  alerts,
}: {
  alerts: NonNullable<ReturnType<typeof useSessionAlerts>["data"]>;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-destructive/10 p-2 text-destructive">
            <IconAlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Alertas da Sessão</CardTitle>
            <CardDescription>
              {alerts.length}{" "}
              {alerts.length === 1 ? "alerta ativo" : "alertas ativos"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-lg border border-destructive/30 bg-destructive/5 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-destructive">
                      {alert.measure?.name || "Medida"}
                    </p>
                    <p className="text-sm text-foreground/90">
                      {alert.message}
                    </p>
                  </div>
                  <Badge variant="destructive">
                    {alert.threshold_type === "lower"
                      ? "Abaixo do limite"
                      : "Acima do limite"}
                  </Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>Limite: {alert.threshold_value}</span>
                  <span>Valor: {alert.triggered_value}</span>
                  <span>{new Date(alert.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            Nenhum alerta disparado nesta sessão.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MeasuresGrid({
  measures,
  getThresholds,
}: {
  measures: Measure[];
  getThresholds: (measureId: string) => Thresholds;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {measures.map((measure) => {
        const thresholds = getThresholds(measure.id);

        return (
          <div
            key={measure.id}
            className="flex flex-col space-y-1 rounded-lg border border-border bg-muted/20 p-4 transition-colors hover:bg-muted/40"
          >
            <span className="text-sm font-medium">{measure.name}</span>
            {measure.unit && (
              <span className="text-xs text-muted-foreground">
                Unidade: {measure.unit}
              </span>
            )}
            {measure.data_type && (
              <span className="text-xs capitalize text-muted-foreground">
                Tipo: {measure.data_type}
              </span>
            )}
            {thresholds.lower !== null && (
              <span className="text-xs text-muted-foreground">
                Limite inferior: {thresholds.lower}
              </span>
            )}
            {thresholds.upper !== null && (
              <span className="text-xs text-muted-foreground">
                Limite superior: {thresholds.upper}
              </span>
            )}
          </div>
        );
      })}
      {measures.length === 0 && (
        <span className="col-span-full text-sm text-muted-foreground">
          Nenhuma medida configurada
        </span>
      )}
    </div>
  );
}

function AddLogForm({
  measures,
  newLogDate,
  newLogNotes,
  newLogValues,
  isSaving,
  onDateChange,
  onNotesChange,
  onValueChange,
  onSave,
  onCancel,
}: AddLogFormProps) {
  return (
    <div className="space-y-4 rounded-lg border border-dashed border-primary bg-primary/5 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Novo Registro</h3>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="default"
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <IconCheck className="mr-2 h-4 w-4" />
            )}
            Salvar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onCancel}
            disabled={isSaving}
          >
            <IconX className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="new-log-date" className="text-sm font-medium">
            Data/Hora
          </label>
          <Input
            id="new-log-date"
            type="datetime-local"
            value={newLogDate}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="new-log-notes" className="text-sm font-medium">
            Notas
          </label>
          <Input
            id="new-log-notes"
            value={newLogNotes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Observações sobre este registro..."
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Medidas</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {measures.map((measure) => {
            const options = getOptions(measure);
            const inputId = `measure-${measure.id}`;

            return (
              <div key={measure.id} className="space-y-1">
                <label
                  htmlFor={inputId}
                  className="text-xs text-muted-foreground"
                >
                  {measure.name}
                  {measure.unit && (
                    <span className="ml-1">({measure.unit})</span>
                  )}
                </label>
                {options.length > 0 ? (
                  <Select
                    value={newLogValues[measure.id] || ""}
                    onValueChange={(value) => onValueChange(measure.id, value)}
                  >
                    <SelectTrigger id={inputId} className="w-full">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {options.map((option: string) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={inputId}
                    value={newLogValues[measure.id] || ""}
                    onChange={(e) => onValueChange(measure.id, e.target.value)}
                    type={measure.data_type === "number" ? "number" : "text"}
                    placeholder={`Valor de ${measure.name}...`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LogListRow({
  log,
  measures,
  isExpanded,
  isDeleting,
  onToggle,
  onDelete,
}: LogListRowProps) {
  const valueMap = new Map(
    log.values?.map((value): [string, string | null] => [
      value.measure_id,
      value.value ?? null,
    ]) || [],
  );

  return (
    <div className="overflow-hidden rounded-lg border transition-colors hover:border-primary/50">
      <div className="flex items-stretch justify-between">
        <button
          type="button"
          className="flex flex-1 items-center justify-between p-4 text-left hover:bg-muted/50"
          onClick={() => onToggle(log.id)}
          aria-expanded={isExpanded}
        >
          <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Data/Hora</span>
              <div className="font-medium">
                {new Date(log.logged_at).toLocaleString()}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Notas</span>
              <div className="truncate text-sm">{log.notes || "-"}</div>
            </div>
          </div>
          <span className="ml-4">
            {isExpanded ? (
              <IconChevronUp className="h-4 w-4" />
            ) : (
              <IconChevronDown className="h-4 w-4" />
            )}
          </span>
        </button>
        <div className="flex items-center px-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={(event) => onDelete(log.id, event)}
            disabled={isDeleting}
            aria-label="Excluir registro"
          >
            <IconTrash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t bg-muted/20 p-4">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Medidas Registradas</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {measures.map((measure) => {
                const value = valueMap.get(measure.id);

                return (
                  <div
                    key={measure.id}
                    className="flex flex-col space-y-1 rounded-md border bg-background p-3"
                  >
                    <span className="text-xs text-muted-foreground">
                      {measure.name}
                      {measure.unit && (
                        <span className="ml-1">({measure.unit})</span>
                      )}
                    </span>
                    <span className="font-medium">{value ?? "-"}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LogTableRow({ log, measures, isDeleting, onDelete }: LogRowProps) {
  const valueMap = new Map(
    log.values?.map((value): [string, string | null] => [
      value.measure_id,
      value.value ?? null,
    ]) || [],
  );

  return (
    <TableRow className="text-xs">
      <TableCell className="sticky left-0 z-10 min-w-44 bg-card text-xs font-medium shadow-[1px_0_0_0_var(--border)]">
        <div className="leading-tight">
          {new Date(log.logged_at).toLocaleString()}
        </div>
      </TableCell>
      {measures.map((measure) => {
        const value = valueMap.get(measure.id);

        return (
          <TableCell key={measure.id} className="min-w-28 py-2 text-xs">
            <span className="block truncate">{value ?? "-"}</span>
          </TableCell>
        );
      })}
      <TableCell className="min-w-40 max-w-56 py-2 text-xs text-muted-foreground">
        <span className="block truncate">{log.notes || "-"}</span>
      </TableCell>
      <TableCell className="sticky right-0 z-10 w-14 bg-card py-1 text-right shadow-[-1px_0_0_0_var(--border)]">
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={(event) => onDelete(log.id, event)}
            disabled={isDeleting}
            aria-label="Excluir registro"
          >
            <IconTrash className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function EmptyLogsState() {
  return (
    <div className="py-12 text-center text-muted-foreground">
      <p>Nenhum registro de medidas ainda.</p>
      <p className="mt-2 text-sm">
        Clique em "Adicionar Registro" para começar.
      </p>
    </div>
  );
}

type TimeSeriesRecordsContentProps = {
  deleteLogPending: boolean;
  expandedRows: Set<string>;
  logs: TreatmentLog[];
  measures: Measure[];
  onDelete: (logId: string, event: MouseEvent<HTMLButtonElement>) => void;
  onToggle: (logId: string) => void;
  showEmptyLogsState: boolean;
  sortedLogs: TreatmentLog[];
  viewMode: "list" | "table" | "chart";
};

function TimeSeriesRecordsContent({
  deleteLogPending,
  expandedRows,
  logs,
  measures,
  onDelete,
  onToggle,
  showEmptyLogsState,
  sortedLogs,
  viewMode,
}: TimeSeriesRecordsContentProps) {
  if (viewMode === "chart") {
    return <TreatmentChart logs={logs} measures={measures} />;
  }

  if (showEmptyLogsState) {
    return <EmptyLogsState />;
  }

  if (viewMode === "list") {
    return (
      <>
        {sortedLogs.map((log) => (
          <LogListRow
            key={log.id}
            log={log}
            measures={measures}
            isExpanded={expandedRows.has(log.id)}
            isDeleting={deleteLogPending}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        ))}
      </>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border">
      <div className="w-full overflow-x-auto">
        <Table className="min-w-max text-xs">
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="sticky left-0 z-20 min-w-44 bg-muted/40 shadow-[1px_0_0_0_var(--border)]">
                Data/Hora
              </TableHead>
              {measures.map((measure) => (
                <TableHead
                  key={measure.id}
                  className="min-w-28 max-w-32 px-2 py-2 text-xs leading-tight whitespace-normal"
                >
                  <div>{measure.name}</div>
                  {measure.unit && (
                    <div className="text-[11px] font-normal text-muted-foreground">
                      {measure.unit}
                    </div>
                  )}
                </TableHead>
              ))}
              <TableHead className="min-w-40 px-2 py-2 text-xs">
                Notas
              </TableHead>
              <TableHead className="sticky right-0 z-20 w-14 bg-muted/40 text-right shadow-[-1px_0_0_0_var(--border)]">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedLogs.map((log) => (
              <LogTableRow
                key={log.id}
                log={log}
                measures={measures}
                isDeleting={deleteLogPending}
                onDelete={onDelete}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default function TreatmentSessionDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: session, isLoading } = useTreatmentSession(id || "");
  const { data: alerts } = useSessionAlerts(id || "");
  const createLog = useCreateTreatmentLog(id || "");
  const deleteLog = useDeleteTreatmentLog(id || "");

  const [isAdding, setIsAdding] = useState(false);
  const [newLogNotes, setNewLogNotes] = useState("");
  const [newLogDate, setNewLogDate] = useState("");
  const [newLogValues, setNewLogValues] = useState<Record<string, string>>({});
  const [expandedRows, setExpandedRows] = useState(new Set<string>());
  const [sessionInfoCollapsed, setSessionInfoCollapsed] = useState(true);
  const [measuresCollapsed, setMeasuresCollapsed] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "table" | "chart">("list");

  if (isLoading) {
    return (
      <PageLayout title="Carregando...">
        <div className="space-y-4">
          <div className="h-30 animate-pulse rounded-xl bg-muted/50" />
        </div>
      </PageLayout>
    );
  }

  if (!session) {
    return (
      <PageLayout title="Sessão não encontrada">
        <div>A sessão de tratamento solicitada não foi encontrada.</div>
      </PageLayout>
    );
  }

  // Extract measures from template
  const measures =
    session.template?.template_measures
      ?.map((tm) => tm.measure)
      .filter(hasMeasure) || [];
  const templateMeasures = session.template?.template_measures || [];

  // Build time series data
  const logs = session.logs || [];
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime(),
  );
  const sessionAlerts = alerts || [];
  const statusLabel = getSessionStatusLabel(session.status);
  const showEmptyLogsState = sortedLogs.length === 0 && !isAdding;

  const getThresholds = (measureId: string) => {
    const templateMeasure = templateMeasures.find(
      (item) => item.measure_id === measureId,
    );
    const measure = measures.find((item) => item?.id === measureId);
    return {
      lower: templateMeasure?.lower_limit ?? measure?.lower_limit ?? null,
      upper: templateMeasure?.upper_limit ?? measure?.upper_limit ?? null,
    };
  };

  const handleStartAdd = () => {
    setNewLogDate(new Date().toISOString().slice(0, 16)); // Current local time in yyyy-mm-ddThh:mm format
    setNewLogNotes("");
    setNewLogValues({});
    setIsAdding(true);
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
  };

  const handleSaveAdd = async () => {
    try {
      // Build values array
      const values = Object.entries(newLogValues)

        .filter(([, value]) => value !== undefined && value !== "")
        .map(([measureId, value]) => ({
          measure_id: measureId,
          value: value,
        }));

      await createLog.mutateAsync({
        notes: newLogNotes,
        logged_at: newLogDate ? new Date(newLogDate).toISOString() : undefined,
        values: values,
      });

      toast.success("Registro adicionado com sucesso!");
      setIsAdding(false);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao adicionar registro. Tente novamente.");
    }
  };

  const toggleRow = (logId: string) => {
    setExpandedRows((current) => {
      const next = new Set(current);

      if (next.has(logId)) {
        next.delete(logId);
      } else {
        next.add(logId);
      }

      return next;
    });
  };

  const handleDeleteLog = async (
    logId: string,
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation(); // Prevent row expansion when clicking delete

    if (!confirm("Tem certeza que deseja excluir este registro?")) {
      return;
    }

    try {
      await deleteLog.mutateAsync(logId);
      toast.success("Registro excluído com sucesso!");
      setExpandedRows((current) => {
        const next = new Set(current);
        next.delete(logId);
        return next;
      });
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir registro. Tente novamente.");
    }
  };

  return (
    <PageLayout title={`Sessão: ${session.template?.name || "Tratamento"}`}>
      <div className="space-y-6 w-full min-w-0">
        {/* Session Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <IconInfoCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Informações da Sessão</CardTitle>
                <CardDescription>
                  Dados gerais do tratamento e paciente
                </CardDescription>
              </div>
            </div>
            <CardAction>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSessionInfoCollapsed(!sessionInfoCollapsed)}
              >
                {sessionInfoCollapsed ? (
                  <IconChevronDown className="h-4 w-4" />
                ) : (
                  <IconChevronUp className="h-4 w-4" />
                )}
              </Button>
            </CardAction>
          </CardHeader>
          {!sessionInfoCollapsed && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="flex flex-col space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Paciente
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-lg">
                      {session.patient?.name || "-"}
                    </span>
                    <Badge
                      variant={
                        session.status === "active" ? "default" : "secondary"
                      }
                      className="capitalize"
                    >
                      {statusLabel}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Modelo
                  </span>
                  <span className="font-medium">
                    {session.template?.name || "-"}
                  </span>
                </div>

                <div className="flex flex-col space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    {session.completed_at ? "Período" : "Iniciado em"}
                  </span>
                  <div className="flex flex-col">
                    <span>{new Date(session.started_at).toLocaleString()}</span>
                    {session.completed_at && (
                      <span className="text-xs text-muted-foreground">
                        Até {new Date(session.completed_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Total de Registros
                  </span>
                  <span className="font-medium text-lg">{logs.length}</span>
                </div>
              </div>

              {session.notes && (
                <div className="mt-6 pt-4 border-t flex flex-col space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Notas
                  </span>
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {session.notes}
                  </p>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        <SessionAlertsCard alerts={sessionAlerts} />

        {/* Measures Being Monitored */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div
                className={`rounded-lg p-2 ${themeAccentClasses.primary.icon}`}
              >
                <IconRulerMeasure className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Medidas Monitoradas</CardTitle>
                <CardDescription>
                  {measures.length}{" "}
                  {measures.length === 1
                    ? "medida configurada"
                    : "medidas configuradas"}{" "}
                  neste modelo
                </CardDescription>
              </div>
            </div>
            <CardAction>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMeasuresCollapsed(!measuresCollapsed)}
              >
                {measuresCollapsed ? (
                  <IconChevronDown className="h-4 w-4" />
                ) : (
                  <IconChevronUp className="h-4 w-4" />
                )}
              </Button>
            </CardAction>
          </CardHeader>
          {!measuresCollapsed && (
            <CardContent>
              <MeasuresGrid measures={measures} getThresholds={getThresholds} />
            </CardContent>
          )}
        </Card>

        {/* Time Series Records */}
        <Card className="w-full min-w-0 overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div
                className={`rounded-lg p-2 ${themeAccentClasses.chart2.icon}`}
              >
                <IconTimeline className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Série Temporal de Medidas</CardTitle>
                <CardDescription>
                  {logs.length} {logs.length === 1 ? "registro" : "registros"}{" "}
                  de acompanhamento
                </CardDescription>
              </div>
            </div>
            <CardAction>
              <div className="flex items-center gap-2">
                {/* View Toggle */}
                <div className="flex items-center rounded-lg overflow-hidden border">
                  <Button
                    size="sm"
                    variant={viewMode === "list" ? "default" : "ghost"}
                    onClick={() => setViewMode("list")}
                    className="rounded-none"
                  >
                    <IconTimeline className="mr-2 h-4 w-4" />
                    Lista
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === "table" ? "default" : "ghost"}
                    onClick={() => setViewMode("table")}
                    className="rounded-none"
                  >
                    <IconTable className="mr-2 h-4 w-4" />
                    Tabela
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === "chart" ? "default" : "ghost"}
                    onClick={() => setViewMode("chart")}
                    className="rounded-none"
                  >
                    <IconChartLine className="mr-2 h-4 w-4" />
                    Gráfico
                  </Button>
                </div>
                {!isAdding && (
                  <Button size="sm" onClick={handleStartAdd}>
                    <IconPlus className="mr-2 h-4 w-4" />
                    Adicionar Registro
                  </Button>
                )}
              </div>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 w-full min-w-0">
              {isAdding && (
                <AddLogForm
                  measures={measures}
                  newLogDate={newLogDate}
                  newLogNotes={newLogNotes}
                  newLogValues={newLogValues}
                  isSaving={createLog.isPending}
                  onDateChange={setNewLogDate}
                  onNotesChange={setNewLogNotes}
                  onValueChange={(measureId, value) =>
                    setNewLogValues({
                      ...newLogValues,
                      [measureId]: value,
                    })
                  }
                  onSave={handleSaveAdd}
                  onCancel={handleCancelAdd}
                />
              )}
              <TimeSeriesRecordsContent
                deleteLogPending={deleteLog.isPending}
                expandedRows={expandedRows}
                logs={logs}
                measures={measures}
                onDelete={handleDeleteLog}
                onToggle={toggleRow}
                showEmptyLogsState={showEmptyLogsState}
                sortedLogs={sortedLogs}
                viewMode={viewMode}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
