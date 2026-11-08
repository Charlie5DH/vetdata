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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertIcon,
  ChevDIcon,
  PlusIcon,
  RecordIcon,
  TrashIcon,
} from "@/components/icons/vetdata-icons";
import { toast } from "sonner";
import type { Measure, TreatmentLog } from "@/types";
import { TreatmentChart } from "@/components/TreatmentChart";
import { cn } from "@/lib/utils";

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

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Numeric readings get a decimal comma; other values are shown as typed. "—" when missing. */
function formatMeasureValue(
  value: string | number | null | undefined,
  measure?: Measure,
) {
  if (value === null || value === undefined || value === "") return "—";
  const number = Number(value);
  if (measure?.data_type === "number" && !Number.isNaN(number)) {
    return number.toLocaleString("pt-BR", { maximumFractionDigits: 3 });
  }
  return String(value);
}

function CollapseButton({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={onToggle}
      aria-expanded={!collapsed}
      aria-label={collapsed ? "Expandir" : "Recolher"}
      className="text-muted-foreground"
    >
      <ChevDIcon
        className={cn(
          "transition-transform duration-150",
          !collapsed && "rotate-180",
        )}
      />
    </Button>
  );
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
        <CardTitle>Alertas da sessão</CardTitle>
        <CardDescription>
          {alerts.length}{" "}
          {alerts.length === 1 ? "alerta ativo" : "alertas ativos"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {alerts.length > 0 ? (
          <div className="flex flex-col gap-2">
            {alerts.map((alert) => {
              const unit = alert.measure?.unit ? ` ${alert.measure.unit}` : "";
              return (
                <div
                  key={alert.id}
                  className="grid grid-cols-[16px_1fr] gap-x-3 gap-y-1 rounded-lg border border-warning/25 bg-warning-soft px-4 py-3.5 text-[13.5px]"
                >
                  <AlertIcon size={16} className="mt-0.5 text-warning" />
                  <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                    <div className="flex flex-col gap-0.5">
                      <p className="font-semibold text-foreground">
                        {alert.measure?.name || "Medida"}
                      </p>
                      <p className="text-stone-700">{alert.message}</p>
                    </div>
                    <Badge variant="warning">
                      {alert.threshold_type === "lower"
                        ? "Abaixo do limite"
                        : "Acima do limite"}
                    </Badge>
                  </div>
                  <div className="col-start-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground tabular-nums">
                    <span>
                      Limite:{" "}
                      {formatMeasureValue(alert.threshold_value, alert.measure ?? undefined)}
                      {unit}
                    </span>
                    <span>
                      Valor:{" "}
                      <span className="font-semibold text-foreground">
                        {formatMeasureValue(alert.triggered_value, alert.measure ?? undefined)}
                        {unit}
                      </span>
                    </span>
                    <span>{formatDateTime(alert.created_at)}</span>
                  </div>
                </div>
              );
            })}
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
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {measures.map((measure) => {
        const thresholds = getThresholds(measure.id);

        return (
          <div
            key={measure.id}
            className="flex flex-col gap-0.5 rounded-lg bg-muted px-4 py-3"
          >
            <span className="text-sm font-semibold">{measure.name}</span>
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
              <span className="text-xs text-muted-foreground tabular-nums">
                Limite inferior: {formatMeasureValue(thresholds.lower, measure)}
                {measure.unit ? ` ${measure.unit}` : ""}
              </span>
            )}
            {thresholds.upper !== null && (
              <span className="text-xs text-muted-foreground tabular-nums">
                Limite superior: {formatMeasureValue(thresholds.upper, measure)}
                {measure.unit ? ` ${measure.unit}` : ""}
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
    <div className="flex flex-col gap-4 rounded-lg border border-input bg-muted p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold">Novo registro</h3>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            variant="default"
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving && <Spinner />}
            Salvar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="new-log-date" className="text-[13px] font-semibold">
            Data/Hora
          </label>
          <Input
            id="new-log-date"
            type="datetime-local"
            value={newLogDate}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="new-log-notes" className="text-[13px] font-semibold">
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

      <div className="flex flex-col gap-2">
        <p className="text-[13px] font-semibold">Medidas</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {measures.map((measure) => {
            const options = getOptions(measure);
            const inputId = `measure-${measure.id}`;

            return (
              <div key={measure.id} className="flex flex-col gap-1.5">
                <label
                  htmlFor={inputId}
                  className="text-[13px] text-muted-foreground"
                >
                  {measure.name}
                </label>
                {options.length > 0 ? (
                  <Select
                    value={newLogValues[measure.id] || ""}
                    onValueChange={(value) => onValueChange(measure.id, value)}
                  >
                    <SelectTrigger id={inputId} className="w-full bg-card">
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
                  <div className="relative">
                    <Input
                      id={inputId}
                      value={newLogValues[measure.id] || ""}
                      onChange={(e) =>
                        onValueChange(measure.id, e.target.value)
                      }
                      type={measure.data_type === "number" ? "number" : "text"}
                      placeholder={`Valor de ${measure.name}...`}
                      className={cn(
                        "bg-card",
                        measure.unit && "pr-14",
                        measure.data_type === "number" && "tabular-nums",
                      )}
                    />
                    {measure.unit ? (
                      <span className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 text-[13px] text-muted-foreground">
                        {measure.unit}
                      </span>
                    ) : null}
                  </div>
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
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="flex items-stretch justify-between">
        <button
          type="button"
          className="flex flex-1 items-center justify-between px-4 py-3 text-left transition-colors duration-150 hover:bg-muted"
          onClick={() => onToggle(log.id)}
          aria-expanded={isExpanded}
        >
          <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Data/Hora</span>
              <div className="text-sm font-semibold tabular-nums">
                {formatDateTime(log.logged_at)}
              </div>
            </div>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Notas</span>
              <div className="truncate text-sm text-stone-700">
                {log.notes || "—"}
              </div>
            </div>
          </div>
          <ChevDIcon
            className={cn(
              "ml-4 shrink-0 text-muted-foreground transition-transform duration-150",
              isExpanded && "rotate-180",
            )}
          />
        </button>
        <div className="flex items-center px-2">
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-destructive hover:bg-destructive-soft hover:text-destructive"
            onClick={(event) => onDelete(log.id, event)}
            disabled={isDeleting}
            aria-label="Excluir registro"
          >
            <TrashIcon />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-border px-4 py-3">
          <h4 className="mb-2 text-[13px] font-semibold">
            Medidas registradas
          </h4>
          <dl className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
            {measures.map((measure) => {
              const value = valueMap.get(measure.id);
              const hasValue = value !== null && value !== undefined && value !== "";

              return (
                <div
                  key={measure.id}
                  className="flex items-baseline justify-between gap-3 border-b border-border py-2 text-sm"
                >
                  <dt className="text-muted-foreground">{measure.name}</dt>
                  <dd className="text-right font-semibold tabular-nums">
                    {formatMeasureValue(value, measure)}
                    {hasValue && measure.unit ? (
                      <span className="ml-1 font-medium text-muted-foreground">
                        {measure.unit}
                      </span>
                    ) : null}
                  </dd>
                </div>
              );
            })}
          </dl>
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
    <TableRow>
      <TableCell className="sticky left-0 z-10 min-w-32 bg-card font-semibold text-foreground tabular-nums shadow-[1px_0_0_0_var(--border)] md:min-w-44">
        {formatDateTime(log.logged_at)}
      </TableCell>
      {measures.map((measure) => {
        const value = valueMap.get(measure.id);
        const isNumber = measure.data_type === "number";

        return (
          <TableCell
            key={measure.id}
            className={cn(
              "min-w-24 py-2 md:min-w-28",
              isNumber && "text-right tabular-nums",
            )}
          >
            <span className="block truncate">
              {formatMeasureValue(value, measure)}
            </span>
          </TableCell>
        );
      })}
      <TableCell className="max-w-40 min-w-32 py-2 text-muted-foreground md:max-w-56 md:min-w-40">
        <span className="block truncate">{log.notes || "—"}</span>
      </TableCell>
      <TableCell className="sticky right-0 z-10 w-14 bg-card py-1 pl-0 text-right shadow-[-1px_0_0_0_var(--border)]">
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-destructive hover:bg-destructive-soft hover:text-destructive"
            onClick={(event) => onDelete(log.id, event)}
            disabled={isDeleting}
            aria-label="Excluir registro"
          >
            <TrashIcon />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function EmptyLogsState() {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <span className="mb-1 grid size-12 place-items-center rounded-full bg-muted text-foreground">
        <RecordIcon size={20} />
      </span>
      <p className="text-[15px] font-semibold">
        Nenhum registro de medidas ainda.
      </p>
      <p className="text-sm text-muted-foreground">
        Clique em "Adicionar registro" para começar.
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
    <div className="w-full overflow-hidden rounded-xl border border-border">
      <div className="w-full overflow-x-auto">
        <Table className="min-w-max">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="sticky left-0 z-20 min-w-32 bg-background shadow-[1px_0_0_0_var(--border)] md:min-w-44">
                Data/Hora
              </TableHead>
              {measures.map((measure) => (
                <TableHead
                  key={measure.id}
                  className={cn(
                    "max-w-28 min-w-24 py-2 leading-tight whitespace-normal md:max-w-32 md:min-w-28",
                    measure.data_type === "number" && "text-right",
                  )}
                >
                  <div>{measure.name}</div>
                  {measure.unit && (
                    <div className="text-[11px] font-normal text-muted-foreground">
                      {measure.unit}
                    </div>
                  )}
                </TableHead>
              ))}
              <TableHead className="min-w-32 py-2 md:min-w-40">
                Notas
              </TableHead>
              <TableHead className="sticky right-0 z-20 w-14 bg-background pl-0 text-right shadow-[-1px_0_0_0_var(--border)]">
                <span className="sr-only">Ações</span>
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
        <div className="flex h-40 items-center justify-center">
          <Spinner className="size-6 text-muted-foreground" />
        </div>
      </PageLayout>
    );
  }

  if (!session) {
    return (
      <PageLayout title="Sessão não encontrada">
        <div className="text-sm text-muted-foreground">
          A sessão de tratamento solicitada não foi encontrada.
        </div>
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
    <PageLayout
      title={`Sessão: ${session.template?.name || "Tratamento"}`}
      description={
        <span className="flex flex-wrap items-center gap-2">
          {session.patient?.name || "—"}
          <Badge variant={session.status === "active" ? "info" : "secondary"}>
            {session.status === "active" ? (
              <span aria-hidden className="size-1.5 rounded-full bg-current" />
            ) : null}
            {statusLabel}
          </Badge>
        </span>
      }
    >
      <div className="flex w-full min-w-0 flex-col gap-4">
        {/* Session Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações da sessão</CardTitle>
            <CardDescription>
              Dados gerais do tratamento e paciente
            </CardDescription>
            <CardAction>
              <CollapseButton
                collapsed={sessionInfoCollapsed}
                onToggle={() => setSessionInfoCollapsed(!sessionInfoCollapsed)}
              />
            </CardAction>
          </CardHeader>
          {!sessionInfoCollapsed && (
            <CardContent>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[13px] text-muted-foreground">
                    Paciente
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-semibold">
                      {session.patient?.name || "—"}
                    </span>
                    <Badge
                      variant={
                        session.status === "active" ? "info" : "secondary"
                      }
                    >
                      {statusLabel}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[13px] text-muted-foreground">
                    Modelo
                  </span>
                  <span className="text-[15px] font-semibold">
                    {session.template?.name || "—"}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[13px] text-muted-foreground">
                    {session.completed_at ? "Período" : "Iniciado em"}
                  </span>
                  <div className="flex flex-col tabular-nums">
                    <span className="text-sm">
                      {formatDateTime(session.started_at)}
                    </span>
                    {session.completed_at && (
                      <span className="text-xs text-muted-foreground">
                        Até {formatDateTime(session.completed_at)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[13px] text-muted-foreground">
                    Total de registros
                  </span>
                  <span className="text-[28px] leading-tight font-semibold tracking-[-0.02em] tabular-nums">
                    {logs.length}
                  </span>
                </div>
              </div>

              {session.notes && (
                <div className="mt-5 flex flex-col gap-1 border-t border-border pt-4">
                  <span className="text-[13px] text-muted-foreground">
                    Notas
                  </span>
                  <p className="text-sm leading-relaxed text-stone-700">
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
            <CardTitle>Medidas monitoradas</CardTitle>
            <CardDescription>
              {measures.length}{" "}
              {measures.length === 1
                ? "medida configurada"
                : "medidas configuradas"}{" "}
              neste modelo
            </CardDescription>
            <CardAction>
              <CollapseButton
                collapsed={measuresCollapsed}
                onToggle={() => setMeasuresCollapsed(!measuresCollapsed)}
              />
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
            <CardTitle>Série temporal de medidas</CardTitle>
            <CardDescription>
              {logs.length} {logs.length === 1 ? "registro" : "registros"} de
              acompanhamento
            </CardDescription>
            <CardAction>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Tabs
                  value={viewMode}
                  onValueChange={(value) =>
                    setViewMode(value as "list" | "table" | "chart")
                  }
                >
                  <TabsList>
                    <TabsTrigger value="list">Lista</TabsTrigger>
                    <TabsTrigger value="table">Tabela</TabsTrigger>
                    <TabsTrigger value="chart">Gráfico</TabsTrigger>
                  </TabsList>
                </Tabs>
                {!isAdding && (
                  <Button size="sm" variant="cta" onClick={handleStartAdd}>
                    <PlusIcon />
                    Adicionar registro
                  </Button>
                )}
              </div>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="flex w-full min-w-0 flex-col gap-3">
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
