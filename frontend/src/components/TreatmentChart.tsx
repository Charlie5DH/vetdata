import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { TreatmentLog, Measure } from "@/types";

interface TreatmentChartProps {
  logs: TreatmentLog[];
  measures: Measure[];
}

type NonNumericTooltipEntry = {
  measureId: string;
  label: string;
  unit?: string | null;
  value: string;
};

type ChartDataPoint = {
  timestamp: string;
  fullTimestamp: string;
  nonNumericValues: NonNumericTooltipEntry[];
} & Record<string, string | number | NonNumericTooltipEntry[]>;

type TooltipPayloadEntry = {
  color?: string;
  dataKey?: string | number;
  payload?: ChartDataPoint;
  value?: string | number;
};

type TreatmentChartTooltipProps = {
  active?: boolean;
  labels: Record<string, string>;
  payload?: TooltipPayloadEntry[];
};

// Color palette for measures
const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

// Line points: 3px dots, 4.5px end dot with a card ring (DESIGN.md §10)
function renderPointDot(
  { cx, cy, index }: { cx?: number; cy?: number; index?: number },
  color: string,
  isLast: boolean,
) {
  if (cx === undefined || cy === undefined) {
    return <g key={`dot-${index}`} />;
  }

  return (
    <circle
      key={`dot-${index}`}
      cx={cx}
      cy={cy}
      r={isLast ? 4.5 : 3}
      fill={color}
      stroke={isLast ? "var(--card)" : "none"}
      strokeWidth={isLast ? 2 : 0}
    />
  );
}

function TreatmentChartTooltip({
  active,
  labels,
  payload,
}: TreatmentChartTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const dataPoint = payload[0]?.payload;

  if (!dataPoint) {
    return null;
  }

  return (
    <div className="grid min-w-56 gap-2 rounded-lg bg-primary px-3 py-2 text-xs leading-tight text-primary-foreground shadow-md">
      <div className="font-semibold text-forest-300 tabular-nums">{dataPoint.fullTimestamp}</div>
      <div className="grid gap-1.5">
        {payload.map((item) => {
          if (
            typeof item.dataKey !== "string" ||
            item.value === undefined ||
            item.value === null
          ) {
            return null;
          }

          return (
            <div
              key={item.dataKey}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2">
                <div
                  className="size-2.5 rounded-[3px] outline outline-1 outline-primary-foreground/30"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-forest-200">
                  {labels[item.dataKey] ?? item.dataKey}
                </span>
              </div>
              <span className="font-semibold tabular-nums text-primary-foreground">
                {typeof item.value === "number"
                  ? item.value.toLocaleString("pt-BR")
                  : item.value}
              </span>
            </div>
          );
        })}
      </div>
      {dataPoint.nonNumericValues.length > 0 && (
        <div className="grid gap-1.5 border-t border-primary-foreground/15 pt-2">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-forest-300">
            Medidas adicionais
          </div>
          {dataPoint.nonNumericValues.map((entry) => (
            <div
              key={entry.measureId}
              className="flex items-start justify-between gap-3"
            >
              <span className="text-forest-200">
                {entry.label}
                {entry.unit ? ` (${entry.unit})` : ""}
              </span>
              <span className="text-right font-semibold text-primary-foreground">
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


const formatStat = (value: number) =>
  value.toLocaleString("pt-BR", { maximumFractionDigits: 2 });

export function TreatmentChart({ logs, measures }: TreatmentChartProps) {
  // Filter to only numeric measures
  const numericMeasures = measures.filter((m) => m.data_type === "number");
  const measureMap = useMemo(
    () => new Map(measures.map((measure) => [measure.id, measure])),
    [measures],
  );
  const numericLabels = useMemo(
    () =>
      Object.fromEntries(
        numericMeasures.map((measure) => [
          measure.id,
          measure.unit ? `${measure.name} (${measure.unit})` : measure.name,
        ]),
      ),
    [numericMeasures],
  );

  // State to track which measures are visible
  const [visibleMeasures, setVisibleMeasures] = useState<Set<string>>(
    new Set(numericMeasures.map((m) => m.id)),
  );

  // Transform data for chart
  const chartData = useMemo(() => {
    // Sort logs by date
    const sortedLogs = [...logs].sort(
      (a, b) =>
        new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime(),
    );

    // Transform each log into a chart data point
    return sortedLogs.map((log) => {
      const dataPoint: ChartDataPoint = {
        timestamp: new Date(log.logged_at).toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        fullTimestamp: new Date(log.logged_at).toLocaleString("pt-BR"),
        nonNumericValues: [],
      };

      log.values?.forEach((value) => {
        const measure = measureMap.get(value.measure_id);
        const rawValue = value.value?.trim();

        if (!measure || !rawValue) {
          return;
        }

        if (measure.data_type === "number") {
          const numValue = Number.parseFloat(rawValue);
          if (!Number.isNaN(numValue)) {
            dataPoint[measure.id] = numValue;
          }

          return;
        }

        dataPoint.nonNumericValues.push({
          measureId: measure.id,
          label: measure.name,
          unit: measure.unit,
          value: rawValue,
        });
      });

      return dataPoint;
    });
  }, [logs, measureMap]);

  // Build chart config
  const chartConfig: ChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    numericMeasures.forEach((measure, index) => {
      config[measure.id] = {
        label: measure.unit
          ? `${measure.name} (${measure.unit})`
          : measure.name,
        color: COLORS[index % COLORS.length],
      };
    });
    return config;
  }, [numericMeasures]);

  // Index of each series' last recorded point, drawn as the larger end dot
  const lastPointIndex = useMemo(() => {
    const result: Record<string, number> = {};
    chartData.forEach((point, pointIndex) => {
      numericMeasures.forEach((measure) => {
        if (typeof point[measure.id] === "number") {
          result[measure.id] = pointIndex;
        }
      });
    });
    return result;
  }, [chartData, numericMeasures]);

  const toggleMeasure = (measureId: string) => {
    const newVisible = new Set(visibleMeasures);
    if (newVisible.has(measureId)) {
      newVisible.delete(measureId);
    } else {
      newVisible.add(measureId);
    }
    setVisibleMeasures(newVisible);
  };

  if (numericMeasures.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-base font-semibold text-foreground">
          Nenhuma medida numérica disponível para visualização.
        </p>
        <p className="mt-1.5 text-[13.5px] text-muted-foreground">
          Apenas medidas do tipo "número" podem ser exibidas no gráfico.
        </p>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-base font-semibold text-foreground">
          Nenhum registro disponível para exibir no gráfico.
        </p>
        <p className="mt-1.5 text-[13.5px] text-muted-foreground">
          Adicione registros com valores numéricos para ver a visualização.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Measure toggles */}
      <div className="flex flex-wrap gap-2">
        {numericMeasures.map((measure, index) => (
          <Button
            key={measure.id}
            size="sm"
            variant="outline"
            aria-pressed={visibleMeasures.has(measure.id)}
            onClick={() => toggleMeasure(measure.id)}
            className="h-7 gap-1.5 rounded-sm bg-card px-2.5 text-[12.5px] font-medium shadow-none hover:bg-muted aria-pressed:border-primary aria-pressed:bg-lemon-100"
          >
            <div
              className="size-2.5 rounded-[3px]"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            {measure.name}
            {measure.unit && (
              <Badge variant="secondary" className="h-[18px] px-1.5 text-[11px] font-medium">
                {measure.unit}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Chart */}
      <ChartContainer config={chartConfig} className="h-100 w-full">
        <LineChart data={chartData}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="timestamp"
            tickLine={false}
            axisLine={{ stroke: "var(--input)" }}
            tickMargin={8}
            angle={0}
            textAnchor="middle"
            minTickGap={24}
            height={48}
          />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} />
          <ChartTooltip content={<TreatmentChartTooltip labels={numericLabels} />} />
          <ChartLegend content={<ChartLegendContent />} />
          {numericMeasures.map((measure, index) =>
            visibleMeasures.has(measure.id) ? (
              <Line
                key={measure.id}
                type="monotone"
                dataKey={measure.id}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                dot={(props: { cx?: number; cy?: number; index?: number }) =>
                  renderPointDot(
                    props,
                    COLORS[index % COLORS.length],
                    props.index === lastPointIndex[measure.id],
                  )
                }
                activeDot={{
                  r: 4.5,
                  strokeWidth: 2,
                  stroke: "var(--card)",
                }}
                connectNulls
              />
            ) : null,
          )}
        </LineChart>
      </ChartContainer>

      {/* Stats summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {numericMeasures
          .filter((measure) => visibleMeasures.has(measure.id))
          .map((measure) => {
            const values = chartData
              .map((d) => d[measure.id] as number)
              .filter((v) => v !== undefined && !Number.isNaN(v));

            if (values.length === 0) return null;

            const current = values.at(-1);
            if (current === undefined) return null;
            const min = Math.min(...values);
            const max = Math.max(...values);
            const avg = values.reduce((a, b) => a + b, 0) / values.length;

            return (
              <div
                key={measure.id}
                className="flex flex-col gap-2.5 rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="size-2.5 rounded-[3px]"
                    style={{
                      backgroundColor:
                        COLORS[
                          numericMeasures.indexOf(measure) % COLORS.length
                        ],
                    }}
                  />
                  <span className="text-[13px] font-semibold text-foreground">{measure.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[12.5px]">
                  <div>
                    <span className="text-muted-foreground">Atual:</span>
                    <p className="text-sm font-semibold tabular-nums text-foreground">
                      {formatStat(current)}{" "}
                      <span className="text-xs font-medium text-muted-foreground">
                        {measure.unit}
                      </span>
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Média:</span>
                    <p className="text-sm font-semibold tabular-nums text-foreground">
                      {formatStat(avg)}{" "}
                      <span className="text-xs font-medium text-muted-foreground">
                        {measure.unit}
                      </span>
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Mín:</span>
                    <p className="text-sm font-semibold tabular-nums text-foreground">
                      {formatStat(min)}{" "}
                      <span className="text-xs font-medium text-muted-foreground">
                        {measure.unit}
                      </span>
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Máx:</span>
                    <p className="text-sm font-semibold tabular-nums text-foreground">
                      {formatStat(max)}{" "}
                      <span className="text-xs font-medium text-muted-foreground">
                        {measure.unit}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
