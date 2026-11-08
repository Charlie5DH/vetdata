import { HeartPulseIcon } from "@/components/icons/vetdata-icons";
import { useTemplate } from "@/api/templates";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface TemplateMeasuresPreviewProps {
  templateId?: string;
}

function hasMeasure<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function TemplateMeasuresPreview({
  templateId,
}: TemplateMeasuresPreviewProps) {
  const { data: template, isLoading } = useTemplate(templateId || "");

  if (!templateId) {
    return null;
  }

  const measures =
    template?.template_measures
      ?.slice()
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
      .map((templateMeasure) => templateMeasure.measure)
      .filter(hasMeasure) ?? [];

  let measuresContent = (
    <div className="flex flex-wrap gap-2">
      {measures.map((measure) => (
        <Badge key={measure.id} variant="outline" className="bg-card">
          {measure.name}
          {measure.unit ? (
            <span className="font-medium text-muted-foreground">
              {measure.unit}
            </span>
          ) : null}
        </Badge>
      ))}
    </div>
  );

  if (isLoading) {
    measuresContent = (
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-[22px] w-28 rounded-full" />
        <Skeleton className="h-[22px] w-24 rounded-full" />
        <Skeleton className="h-[22px] w-32 rounded-full" />
      </div>
    );
  } else if (measures.length === 0) {
    measuresContent = (
      <p className="text-sm text-muted-foreground">
        Este modelo ainda não tem métricas associadas.
      </p>
    );
  }

  return (
    <div className="rounded-lg bg-muted p-4">
      <div className="flex items-start gap-3">
        <HeartPulseIcon size={16} className="mt-0.5 shrink-0 text-foreground" />
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <div className="text-sm font-semibold">Métricas monitoradas</div>
            <div className="text-[13px] text-muted-foreground">
              {template?.name
                ? `Este tratamento irá acompanhar as medidas configuradas em ${template.name}.`
                : "Carregando as medidas configuradas para este tratamento."}
            </div>
          </div>
          {measuresContent}
        </div>
      </div>
    </div>
  );
}
