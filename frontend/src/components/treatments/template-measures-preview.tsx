import { IconActivity } from "@tabler/icons-react";
import { useTemplate } from "@/api/templates";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
        <Badge
          key={measure.id}
          variant="outline"
          className="rounded-full px-3 py-1 text-sm"
        >
          {measure.name}
          {measure.unit ? (
            <span className="text-muted-foreground">({measure.unit})</span>
          ) : null}
        </Badge>
      ))}
    </div>
  );

  if (isLoading) {
    measuresContent = (
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-7 w-32" />
      </div>
    );
  } else if (measures.length === 0) {
    measuresContent = (
      <p className="text-sm text-muted-foreground">
        Este modelo ainda nao tem metricas associadas.
      </p>
    );
  }

  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-background p-2 text-muted-foreground">
          <IconActivity className="size-4" />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <div className="font-medium">Métricas monitoradas</div>
            <div className="text-sm text-muted-foreground">
              {template?.name
                ? `Este tratamento irá acompanhar as medidas configuradas em ${template.name}.`
                : "Carregando as medidas configuradas para este tratamento."}
            </div>
          </div>
          <Separator />
          {measuresContent}
        </div>
      </div>
    </div>
  );
}
