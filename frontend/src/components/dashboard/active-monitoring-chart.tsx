import * as React from "react";
import {
  Area,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipProps } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSessionsAlerts } from "@/api/alerts";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Alert, TreatmentSession } from "@/types";

type MonitoringPoint = {
  timestamp: number;
  value: number;
  loggedAt: string;
  treatmentLogId: string;
  patientId: string;
  patientName: string;
  sessionId: string;
  templateName: string;
};

type MetricSeries = {
  id: string;
  name: string;
  unit?: string | null;
  patientCount: number;
  sessionCount: number;
  points: MonitoringPoint[];
};

type ActiveMonitoringChartProps = {
  sessions?: TreatmentSession[];
  isLoading?: boolean;
};

type ChartType = "line" | "area" | "bar";

type ChartRow = {
  rowId: string;
  timestamp: number;
  loggedAt: string;
  treatmentLogId: string;
  patientId: string;
  patientName: string;
  sessionId: string;
  templateName: string;
} & Record<string, number | string | boolean>;

type DotProps = {
  cx?: number;
  cy?: number;
  payload?: ChartRow;
};

const METRIC_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;
const ALERT_COLOR = "var(--destructive)";

const chartTypeOptions: Array<{ id: ChartType; label: string }> = [
  { id: "line", label: "Linha" },
  { id: "area", label: "Área" },
  { id: "bar", label: "Barras" },
];

const axisDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const tooltipDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function parseNumericValue(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const numericValue = Number.parseFloat(value);
  return Number.isNaN(numericValue) ? null : numericValue;
}

type MutableMetricSeries = MetricSeries & {
  patientIds: Set<string>;
  sessionIds: Set<string>;
};

function getNumericMeasures(session: TreatmentSession) {
  return new Map(
    (session.template?.template_measures ?? [])
      .map((templateMeasure) => templateMeasure.measure)
      .filter(
        (measure): measure is NonNullable<typeof measure> =>
          measure?.data_type === "number",
      )
      .map((measure) => [measure.id, measure]),
  );
}

function ensureMetricSeries(
  metrics: Map<string, MutableMetricSeries>,
  session: TreatmentSession,
  patientId: string,
  numericMeasures: ReturnType<typeof getNumericMeasures>,
) {
  for (const measure of numericMeasures.values()) {
    const metric = metrics.get(measure.id);
    if (metric) {
      metric.patientIds.add(patientId);
      metric.sessionIds.add(session.id);
      continue;
    }

    metrics.set(measure.id, {
      id: measure.id,
      name: measure.name,
      unit: measure.unit,
      patientCount: 0,
      sessionCount: 0,
      points: [],
      patientIds: new Set([patientId]),
      sessionIds: new Set([session.id]),
    });
  }
}

function appendMetricPoints(
  metrics: Map<string, MutableMetricSeries>,
  session: TreatmentSession,
  patientId: string,
  patientName: string,
  templateName: string,
  numericMeasures: ReturnType<typeof getNumericMeasures>,
) {
  for (const log of session.logs ?? []) {
    const timestamp = new Date(log.logged_at).getTime();
    if (Number.isNaN(timestamp)) {
      continue;
    }

    for (const value of log.values ?? []) {
      const measure = numericMeasures.get(value.measure_id);
      const metric = measure ? metrics.get(measure.id) : undefined;
      const numericValue = parseNumericValue(value.value);

      if (!metric || numericValue === null) {
        continue;
      }

      metric.points.push({
        timestamp,
        value: numericValue,
        loggedAt: log.logged_at,
        treatmentLogId: log.id,
        patientId,
        patientName,
        sessionId: session.id,
        templateName,
      });
    }
  }
}

function finalizeMetricSeries(metrics: Map<string, MutableMetricSeries>) {
  return Array.from(metrics.values())
    .map(({ patientIds, sessionIds, points, ...metric }) => ({
      ...metric,
      patientCount: patientIds.size,
      sessionCount: sessionIds.size,
      points: [...points].sort(
        (left: MonitoringPoint, right: MonitoringPoint) =>
          left.timestamp - right.timestamp,
      ),
    }))
    .sort((left: MetricSeries, right: MetricSeries) =>
      left.name.localeCompare(right.name, "pt-BR"),
    );
}

function buildMetricSeries(sessions: TreatmentSession[]): MetricSeries[] {
  const metrics = new Map<string, MutableMetricSeries>();

  for (const session of sessions) {
    if (session.status !== "active") {
      continue;
    }

    const patientId = session.patient?.id ?? session.patient_id;
    const patientName = session.patient?.name ?? "Paciente sem nome";
    const templateName = session.template?.name ?? "Modelo sem nome";
    const numericMeasures = getNumericMeasures(session);

    ensureMetricSeries(metrics, session, patientId, numericMeasures);
    appendMetricPoints(
      metrics,
      session,
      patientId,
      patientName,
      templateName,
      numericMeasures,
    );
  }

  return finalizeMetricSeries(metrics);
}

function formatMetricValue(value: number, unit?: string | null) {
  const formattedValue = value.toLocaleString("pt-BR", {
    maximumFractionDigits: 2,
  });

  return unit ? `${formattedValue} ${unit}` : formattedValue;
}

function formatMetricSelectionLabel(metricNames: string[]) {
  if (!metricNames.length) {
    return "Selecione as métricas";
  }

  if (metricNames.length === 1) {
    return metricNames[0];
  }

  if (metricNames.length === 2) {
    return `${metricNames[0]} + ${metricNames[1]}`;
  }

  return `${metricNames.length} métricas selecionadas`;
}

function renderSelectedMetricSummary(
  metrics: MetricSeries[],
  alertedMetricIds: Set<string>,
) {
  if (!metrics.length) {
    return (
      <span className="truncate text-left text-muted-foreground">
        Selecione as métricas
      </span>
    );
  }

  if (metrics.length === 1) {
    const metric = metrics[0];

    return (
      <span className="flex min-w-0 items-center gap-2 overflow-hidden">
        <span className="truncate text-left">{metric.name}</span>
        {alertedMetricIds.has(metric.id) ? (
          <Badge variant="destructive">Alerta</Badge>
        ) : null}
      </span>
    );
  }

  return (
    <span className="flex min-w-0 items-center gap-2 overflow-hidden">
      <span className="truncate text-left">
        {formatMetricSelectionLabel(metrics.map((metric) => metric.name))}
      </span>
      {metrics.some((metric) => alertedMetricIds.has(metric.id)) ? (
        <Badge variant="destructive">Com alertas</Badge>
      ) : null}
    </span>
  );
}

function buildChartRows(metrics: MetricSeries[]) {
  const rows = new Map<string, ChartRow>();

  for (const metric of metrics) {
    for (const point of metric.points) {
      const rowId = `${point.timestamp}:${point.patientId}:${point.sessionId}`;
      const existingRow = rows.get(rowId);

      if (existingRow) {
        existingRow[metric.id] = point.value;
        continue;
      }

      rows.set(rowId, {
        rowId,
        timestamp: point.timestamp,
        loggedAt: point.loggedAt,
        treatmentLogId: point.treatmentLogId,
        patientId: point.patientId,
        patientName: point.patientName,
        sessionId: point.sessionId,
        templateName: point.templateName,
        [metric.id]: point.value,
      });
    }
  }

  return Array.from(rows.values()).sort(
    (left: ChartRow, right: ChartRow) => left.timestamp - right.timestamp,
  );
}

function buildAlertLookup(alerts: Alert[]) {
  return new Set(
    alerts.map(
      (alert) =>
        `${alert.treatment_session_id}:${alert.treatment_log_id}:${alert.measure_id}`,
    ),
  );
}

function buildThresholdLines(alerts: Alert[], metricIds: string[]) {
  const allowedMetricIds = new Set(metricIds);
  const thresholdMap = new Map<
    string,
    {
      metricId: string;
      thresholdType: string;
      thresholdValue: number;
    }
  >();

  for (const alert of alerts) {
    if (!allowedMetricIds.has(alert.measure_id)) {
      continue;
    }

    const key = `${alert.measure_id}:${alert.threshold_type}:${alert.threshold_value}`;
    if (thresholdMap.has(key)) {
      continue;
    }

    thresholdMap.set(key, {
      metricId: alert.measure_id,
      thresholdType: alert.threshold_type,
      thresholdValue: alert.threshold_value,
    });
  }

  return Array.from(thresholdMap.values());
}

function buildAlertedMetricIds(alerts: Alert[]) {
  return new Set(alerts.map((alert) => alert.measure_id));
}

function applyAlertFlags(rows: ChartRow[], alerts: Alert[]) {
  if (!alerts.length) {
    return rows;
  }

  const alertLookup = buildAlertLookup(alerts);

  return rows.map((row) => {
    const nextRow: ChartRow = { ...row };

    for (const key of Object.keys(row)) {
      if (
        key === "rowId" ||
        key === "timestamp" ||
        key === "loggedAt" ||
        key === "treatmentLogId" ||
        key === "patientId" ||
        key === "patientName" ||
        key === "sessionId" ||
        key === "templateName" ||
        key.startsWith("__alert__")
      ) {
        continue;
      }

      const alertKey = `${row.sessionId}:${row.treatmentLogId}:${key}`;
      if (alertLookup.has(alertKey)) {
        nextRow[`__alert__${key}`] = true;
      }
    }

    return nextRow;
  });
}

function ActiveMonitoringTooltip({
  active,
  payload,
  metricsById,
}: TooltipProps<number, string> & {
  metricsById: Map<string, MetricSeries>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0]?.payload as ChartRow | undefined;
  if (!point) {
    return null;
  }

  return (
    <div className="grid min-w-[16rem] gap-2 rounded-lg border border-border/60 bg-background px-3 py-2 text-xs shadow-xl">
      <div className="space-y-0.5">
        <p className="font-medium text-foreground">{point.patientName}</p>
        <p className="text-muted-foreground">{point.templateName}</p>
      </div>
      <div className="grid gap-1 text-muted-foreground">
        {payload.map((item) => {
          const metricId = `${item.dataKey ?? ""}`;
          const metric = metricsById.get(metricId);

          if (!metric || typeof item.value !== "number") {
            return null;
          }

          return (
            <div
              key={`${point.rowId}:${metricId}`}
              className="flex items-center justify-between gap-4"
            >
              <span className="flex items-center gap-2">
                {point[`__alert__${metricId}`] ? (
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: ALERT_COLOR }}
                  />
                ) : null}
                {metric.name}
                {point[`__alert__${metricId}`] ? (
                  <Badge
                    variant="destructive"
                    className="ml-1 border-destructive/30"
                  >
                    Alerta
                  </Badge>
                ) : null}
              </span>
              <span className="font-medium text-foreground">
                {formatMetricValue(item.value, metric.unit)}
              </span>
            </div>
          );
        })}
        <div className="flex items-center justify-between gap-4">
          <span>Horário</span>
          <span className="text-foreground">
            {tooltipDateFormatter.format(new Date(point.loggedAt))}
          </span>
        </div>
      </div>
    </div>
  );
}

function ChartEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex h-80 flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/15 px-6 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

export function ActiveMonitoringChart({
  sessions,
  isLoading = false,
}: ActiveMonitoringChartProps) {
  const sessionIds = React.useMemo(
    () => (sessions ?? []).map((session) => session.id),
    [sessions],
  );
  const { data: alerts, isLoading: isLoadingAlerts } =
    useSessionsAlerts(sessionIds);
  const metricSeries = React.useMemo(
    () => buildMetricSeries(sessions ?? []),
    [sessions],
  );
  const [selectedMetricIds, setSelectedMetricIds] = React.useState<string[]>(
    [],
  );
  const [chartType, setChartType] = React.useState<ChartType>("line");

  React.useEffect(() => {
    if (!metricSeries.length) {
      if (selectedMetricIds.length) {
        setSelectedMetricIds([]);
      }
      return;
    }

    const availableMetricIds = new Set(metricSeries.map((metric) => metric.id));
    const nextSelectedMetricIds = selectedMetricIds.filter((metricId) =>
      availableMetricIds.has(metricId),
    );

    if (!nextSelectedMetricIds.length) {
      setSelectedMetricIds([metricSeries[0].id]);
      return;
    }

    if (nextSelectedMetricIds.length !== selectedMetricIds.length) {
      setSelectedMetricIds(nextSelectedMetricIds);
    }
  }, [metricSeries, selectedMetricIds]);

  const selectedMetrics = React.useMemo(
    () =>
      metricSeries.filter((metric) => selectedMetricIds.includes(metric.id)),
    [metricSeries, selectedMetricIds],
  );

  const metricsById = React.useMemo(
    () => new Map(metricSeries.map((metric) => [metric.id, metric])),
    [metricSeries],
  );

  const chartData = React.useMemo(
    () => applyAlertFlags(buildChartRows(selectedMetrics), alerts),
    [alerts, selectedMetrics],
  );
  const alertedMetricIds = React.useMemo(
    () => buildAlertedMetricIds(alerts),
    [alerts],
  );
  const thresholdLines = React.useMemo(
    () =>
      buildThresholdLines(
        alerts,
        selectedMetrics.map((metric) => metric.id),
      ),
    [alerts, selectedMetrics],
  );

  const chartConfig = React.useMemo<ChartConfig>(
    () =>
      Object.fromEntries(
        selectedMetrics.map((metric, index) => [
          metric.id,
          {
            label: metric.unit
              ? `${metric.name} (${metric.unit})`
              : metric.name,
            color: METRIC_COLORS[index % METRIC_COLORS.length],
          },
        ]),
      ),
    [selectedMetrics],
  );

  const activeSessionsCount = React.useMemo(
    () =>
      (sessions ?? []).filter((session) => session.status === "active").length,
    [sessions],
  );

  if (isLoading || isLoadingAlerts) {
    return <div className="h-96 animate-pulse rounded-xl bg-muted/40" />;
  }

  if (!activeSessionsCount) {
    return (
      <ChartEmptyState
        title="Nenhuma sessão ativa no momento"
        description="Quando houver pacientes em monitoramento ativo, este painel exibirá a evolução temporal das métricas numéricas registradas em cada sessão."
      />
    );
  }

  if (!metricSeries.length) {
    return (
      <ChartEmptyState
        title="Sem métricas numéricas em monitoramento"
        description="As sessões ativas existem, mas ainda não há medidas numéricas configuradas ou registradas para gerar a visualização do painel."
      />
    );
  }

  const patientCount = new Set(
    selectedMetrics.flatMap((metric) =>
      metric.points.map((point) => point.patientId),
    ),
  ).size;
  const sessionCount = new Set(
    selectedMetrics.flatMap((metric) =>
      metric.points.map((point) => point.sessionId),
    ),
  ).size;
  const latestMetricPoint = selectedMetrics
    .flatMap((metric) =>
      metric.points.map((point) => ({
        point,
        metric,
      })),
    )
    .sort(
      (
        left: { point: MonitoringPoint; metric: MetricSeries },
        right: { point: MonitoringPoint; metric: MetricSeries },
      ) => left.point.timestamp - right.point.timestamp,
    )
    .at(-1);
  const latestMetricHasAlert = latestMetricPoint
    ? Boolean(
        chartData.find(
          (row) =>
            row.rowId ===
            `${latestMetricPoint.point.timestamp}:${latestMetricPoint.point.patientId}:${latestMetricPoint.point.sessionId}`,
        )?.[`__alert__${latestMetricPoint.metric.id}`],
      )
    : false;
  const latestReading = latestMetricPoint
    ? formatMetricValue(
        latestMetricPoint.point.value,
        latestMetricPoint.metric.unit,
      )
    : "Sem registros";

  const toggleMetricSelection = (metricId: string) => {
    setSelectedMetricIds((currentMetricIds) =>
      currentMetricIds.includes(metricId)
        ? currentMetricIds.filter(
            (currentMetricId) => currentMetricId !== metricId,
          )
        : [...currentMetricIds, metricId],
    );
  };

  const renderSeries = (metric: MetricSeries, index: number) => {
    const color = METRIC_COLORS[index % METRIC_COLORS.length];
    const renderDot = (props: DotProps, radius: number) => {
      const { cx, cy, payload } = props;
      const hasAlert = Boolean(payload?.[`__alert__${metric.id}`]);

      return (
        <circle
          cx={typeof cx === "number" ? cx : 0}
          cy={typeof cy === "number" ? cy : 0}
          r={typeof cx === "number" && typeof cy === "number" ? radius : 0}
          fill={hasAlert ? ALERT_COLOR : color}
          strokeWidth={0}
        />
      );
    };

    if (chartType === "area") {
      return (
        <Area
          key={metric.id}
          dataKey={metric.id}
          type="monotone"
          stroke={color}
          fill={color}
          fillOpacity={0.18}
          strokeWidth={2}
          dot={(props: DotProps) => renderDot(props, 4)}
          activeDot={(props: DotProps) => renderDot(props, 6)}
          connectNulls
        />
      );
    }

    if (chartType === "bar") {
      return (
        <Bar
          key={metric.id}
          dataKey={metric.id}
          fill={color}
          radius={[6, 6, 0, 0]}
          maxBarSize={28}
        >
          {chartData.map((row) => (
            <Cell
              key={`${row.rowId}:${metric.id}`}
              fill={row[`__alert__${metric.id}`] ? ALERT_COLOR : color}
            />
          ))}
        </Bar>
      );
    }

    return (
      <Line
        key={metric.id}
        dataKey={metric.id}
        type="linear"
        stroke={color}
        strokeWidth={2}
        dot={(props: DotProps) => renderDot(props, 4)}
        activeDot={(props: DotProps) => renderDot(props, 6)}
        connectNulls
      />
    );
  };

  let chartBody: React.ReactNode;

  if (selectedMetrics.length === 0) {
    chartBody = (
      <ChartEmptyState
        title="Selecione ao menos uma métrica"
        description="Use o seletor de métricas para comparar uma ou mais medidas monitoradas ao mesmo tempo no gráfico do painel."
      />
    );
  } else if (chartData.length === 0) {
    chartBody = (
      <ChartEmptyState
        title="Métrica selecionada sem leituras ainda"
        description="As métricas selecionadas fazem parte de sessões ativas, mas ainda não receberam valores numéricos registrados. Escolha outras métricas ou aguarde novos registros."
      />
    );
  } else {
    chartBody = (
      <ChartContainer config={chartConfig} className="h-96 w-full">
        <ComposedChart data={chartData} margin={{ left: 8, right: 16, top: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="timestamp"
            type="number"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(value) => axisDateFormatter.format(new Date(value))}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
          />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} width={56} />
          {thresholdLines.map((threshold) => (
            <ReferenceLine
              key={`${threshold.metricId}:${threshold.thresholdType}:${threshold.thresholdValue}`}
              y={threshold.thresholdValue}
              stroke={ALERT_COLOR}
              strokeDasharray="6 6"
              ifOverflow="extendDomain"
              label={{
                value:
                  threshold.thresholdType === "lower"
                    ? "Limite inferior"
                    : "Limite superior",
                fill: ALERT_COLOR,
                fontSize: 11,
                position: "insideTopRight",
              }}
            />
          ))}
          <ChartTooltip
            cursor={{ stroke: "var(--border)", strokeDasharray: "4 4" }}
            content={<ActiveMonitoringTooltip metricsById={metricsById} />}
          />
          {selectedMetrics.map((metric, index) => renderSeries(metric, index))}
        </ComposedChart>
      </ChartContainer>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between gap-3">
              {renderSelectedMetricSummary(selectedMetrics, alertedMetricIds)}
              <Badge variant="secondary">{selectedMetrics.length}</Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-80">
            <DropdownMenuLabel>Métricas monitoradas</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {metricSeries.map((metric) => (
              <DropdownMenuCheckboxItem
                key={metric.id}
                checked={selectedMetricIds.includes(metric.id)}
                onSelect={(event) => event.preventDefault()}
                onCheckedChange={() => toggleMetricSelection(metric.id)}
              >
                <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                  <span className="truncate">{metric.name}</span>
                  <div className="flex items-center gap-2">
                    {alertedMetricIds.has(metric.id) ? (
                      <Badge variant="destructive">Alerta</Badge>
                    ) : null}
                    {metric.unit ? (
                      <Badge variant="secondary">{metric.unit}</Badge>
                    ) : null}
                  </div>
                </div>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Select
          value={chartType}
          onValueChange={(value) => setChartType(value as ChartType)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Formato do gráfico" />
          </SelectTrigger>
          <SelectContent>
            {chartTypeOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Pacientes monitorados
          </p>
          <p className="mt-2 text-2xl font-semibold">{patientCount}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Sessões com a métrica
          </p>
          <p className="mt-2 text-2xl font-semibold">{sessionCount}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Última leitura
          </p>
          <p className="mt-2 text-lg font-semibold">{latestReading}</p>
          {latestMetricPoint ? (
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>Medida: {latestMetricPoint.metric.name}</span>
              {latestMetricHasAlert ? (
                <Badge variant="destructive">Alerta</Badge>
              ) : null}
            </div>
          ) : null}
          <p className="mt-1 text-xs text-muted-foreground">
            {latestMetricPoint
              ? `${latestMetricPoint.point.patientName} • ${tooltipDateFormatter.format(
                  new Date(latestMetricPoint.point.loggedAt),
                )}`
              : "Aguardando novas medições"}
          </p>
        </div>
      </div>

      {chartBody}
    </div>
  );
}
