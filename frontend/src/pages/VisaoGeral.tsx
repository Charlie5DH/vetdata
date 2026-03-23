import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  Filter,
  Bird,
  Cat,
  Fish,
  PawPrint,
  Rabbit,
  Dog,
} from "lucide-react";

import { useSessionsAlerts } from "@/api/alerts";
import { useTreatmentSessions } from "@/api/treatments";
import { PageLayout } from "@/components/layout/page-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useClinicPath } from "@/lib/clinic-routes";
import { themeAccentClasses } from "@/lib/theme-styles";
import type { Alert, TreatmentSession } from "@/types";

type OverviewPatient = {
  sessionId: string;
  patientId: string;
  patientName: string;
  species: string;
  hasAlert: boolean;
  alertCount: number;
  latestAlertMessage?: string;
  latestAlertCreatedAt?: string;
  startedAt: string;
};

type TreatmentOverviewGroup = {
  id: string;
  treatmentName: string;
  activePatientCount: number;
  activeAlertCount: number;
  startedAt: string;
  patients: OverviewPatient[];
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

function getSpeciesIcon(species?: string) {
  const normalizedSpecies = species?.toLowerCase().trim();

  switch (normalizedSpecies) {
    case "dog":
    case "canine":
    case "cachorro":
    case "cao":
    case "cão":
    case "canina":
      return Dog;
    case "cat":
    case "feline":
    case "gato":
    case "felina":
      return Cat;
    case "bird":
    case "avian":
    case "ave":
    case "aves":
      return Bird;
    case "fish":
    case "peixe":
      return Fish;
    case "rabbit":
    case "coelho":
      return Rabbit;
    default:
      return PawPrint;
  }
}

function getActiveAlerts(alerts: Alert[]) {
  return alerts.filter((alert) => alert.status === "active");
}

function buildOverviewGroups(
  sessions: TreatmentSession[],
  activeAlerts: Alert[],
): TreatmentOverviewGroup[] {
  const alertCountBySessionId = new Map<string, number>();
  const latestAlertBySessionId = new Map<string, Alert>();

  for (const alert of activeAlerts) {
    const count = alertCountBySessionId.get(alert.treatment_session_id) ?? 0;
    alertCountBySessionId.set(alert.treatment_session_id, count + 1);

    const currentLatest = latestAlertBySessionId.get(
      alert.treatment_session_id,
    );
    if (
      !currentLatest ||
      new Date(alert.created_at).getTime() >
        new Date(currentLatest.created_at).getTime()
    ) {
      latestAlertBySessionId.set(alert.treatment_session_id, alert);
    }
  }

  const groups = new Map<string, TreatmentOverviewGroup>();

  for (const session of sessions) {
    if (session.status !== "active") {
      continue;
    }

    const groupId = session.template?.id ?? session.template_id;
    const treatmentName = session.template?.name ?? "Tratamento sem nome";
    const patientId = session.patient?.id ?? session.patient_id;
    const patientName = session.patient?.name ?? "Paciente sem nome";
    const species = session.patient?.species ?? "";
    const alertCount = alertCountBySessionId.get(session.id) ?? 0;
    const latestAlert = latestAlertBySessionId.get(session.id);
    const patientEntry: OverviewPatient = {
      sessionId: session.id,
      patientId,
      patientName,
      species,
      hasAlert: alertCount > 0,
      alertCount,
      latestAlertMessage: latestAlert?.message,
      latestAlertCreatedAt: latestAlert?.created_at,
      startedAt: session.started_at,
    };

    const existingGroup = groups.get(groupId);
    if (existingGroup) {
      existingGroup.patients.push(patientEntry);
      existingGroup.activeAlertCount += alertCount;
      existingGroup.activePatientCount += 1;
      if (session.started_at < existingGroup.startedAt) {
        existingGroup.startedAt = session.started_at;
      }
      continue;
    }

    groups.set(groupId, {
      id: groupId,
      treatmentName,
      activePatientCount: 1,
      activeAlertCount: alertCount,
      startedAt: session.started_at,
      patients: [patientEntry],
    });
  }

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      patients: [...group.patients].sort(
        (left: OverviewPatient, right: OverviewPatient) => {
          if (left.hasAlert !== right.hasAlert) {
            return Number(right.hasAlert) - Number(left.hasAlert);
          }

          return left.patientName.localeCompare(right.patientName, "pt-BR");
        },
      ),
    }))
    .sort((left: TreatmentOverviewGroup, right: TreatmentOverviewGroup) => {
      if (left.activeAlertCount !== right.activeAlertCount) {
        return right.activeAlertCount - left.activeAlertCount;
      }

      return left.treatmentName.localeCompare(right.treatmentName, "pt-BR");
    });
}

function formatStartedAt(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatAlertTimestamp(value?: string) {
  if (!value) {
    return null;
  }

  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function OverviewSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={`overview-skeleton-${index + 1}`} className="min-h-80">
          <CardHeader className="space-y-3">
            <div className="h-5 w-1/2 animate-pulse rounded bg-muted/60" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted/50" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 5 }).map((__, rowIndex) => (
              <div
                key={`overview-skeleton-row-${rowIndex + 1}`}
                className="h-14 animate-pulse rounded-2xl bg-muted/40"
              />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function VisaoGeral() {
  const { clinicPath } = useClinicPath();
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [onlyWithAlerts, setOnlyWithAlerts] = useState(false);

  const { data: sessions = [], isLoading: isLoadingSessions } =
    useTreatmentSessions();

  const activeSessions = useMemo(
    () => sessions.filter((session) => session.status === "active"),
    [sessions],
  );

  const activeSessionIds = useMemo(
    () => activeSessions.map((session) => session.id),
    [activeSessions],
  );

  const { data: alerts = [], isLoading: isLoadingAlerts } =
    useSessionsAlerts(activeSessionIds);

  const activeAlerts = useMemo(() => getActiveAlerts(alerts), [alerts]);

  const treatmentGroups = useMemo(
    () => buildOverviewGroups(activeSessions, activeAlerts),
    [activeAlerts, activeSessions],
  );

  const speciesOptions = useMemo(() => {
    return Array.from(
      new Set(
        activeSessions
          .map((session) => session.patient?.species?.trim())
          .filter((species): species is string => Boolean(species)),
      ),
    ).sort((left, right) => left.localeCompare(right, "pt-BR"));
  }, [activeSessions]);

  const filteredGroups = useMemo(() => {
    return treatmentGroups
      .map((group) => {
        const patients = group.patients.filter((patient) => {
          const matchesAlert = !onlyWithAlerts || patient.hasAlert;
          const matchesSpecies =
            speciesFilter === "all" || patient.species === speciesFilter;

          return matchesAlert && matchesSpecies;
        });

        const activeAlertCount = patients.reduce(
          (total, patient) => total + patient.alertCount,
          0,
        );

        return {
          ...group,
          patients,
          activePatientCount: patients.length,
          activeAlertCount,
        };
      })
      .filter((group) => group.patients.length > 0);
  }, [onlyWithAlerts, speciesFilter, treatmentGroups]);

  const isLoading = isLoadingSessions || isLoadingAlerts;
  const hasActiveData = treatmentGroups.length > 0;

  return (
    <PageLayout
      title="Visão Geral"
      actions={
        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className="flex h-12 items-center gap-2 rounded-md border border-border/60 bg-muted/20 px-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Label
              htmlFor="overview-only-alerts"
              className="text-xs text-muted-foreground"
            >
              Somente com alertas
            </Label>
            <Switch
              id="overview-only-alerts"
              checked={onlyWithAlerts}
              onCheckedChange={setOnlyWithAlerts}
              size="sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Label
              htmlFor="overview-species"
              className="text-xs text-muted-foreground"
            >
              Espécie
            </Label>
            <Select value={speciesFilter} onValueChange={setSpeciesFilter}>
              <SelectTrigger
                id="overview-species"
                className="min-w-44 bg-background"
              >
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {speciesOptions.map((species) => (
                  <SelectItem key={species} value={species}>
                    {species}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button asChild variant="outline">
            <Link to={clinicPath("/treatments")}>Ver sessões</Link>
          </Button>
        </div>
      }
    >
      <div>
        {isLoading ? <OverviewSkeleton /> : null}

        {!isLoading && !hasActiveData ? (
          <Card className="border-dashed">
            <CardContent className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
              <div
                className={`rounded-2xl p-4 ${themeAccentClasses.neutral.icon}`}
              >
                <Activity className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">
                  Nenhum tratamento ativo
                </h2>
                <p className="max-w-lg text-sm text-muted-foreground">
                  Quando a clínica tiver sessões em andamento, elas aparecerão
                  aqui agrupadas por modelo de tratamento.
                </p>
              </div>
              <Button asChild>
                <Link to={clinicPath("/treatments/new")}>
                  Iniciar tratamento
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && hasActiveData && filteredGroups.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
              <div
                className={`rounded-2xl p-4 ${themeAccentClasses.neutral.icon}`}
              >
                <Filter className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">
                  Nenhum tratamento encontrado
                </h2>
                <p className="max-w-lg text-sm text-muted-foreground">
                  Ajuste os filtros para ver sessões ativas de outras espécies
                  ou incluir pets sem alertas.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && filteredGroups.length > 0 ? (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-4 md:grid-cols-2"
          >
            {filteredGroups.map((group) => (
              <motion.div key={group.id} variants={item}>
                <Card className="flex min-h-88 flex-col overflow-hidden">
                  <CardHeader className="gap-4 border-b border-border/60 bg-muted/20">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <CardTitle className="text-xl">
                          {group.treatmentName}
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <p>Ativo desde {formatStartedAt(group.startedAt)}</p>
                          <Badge variant="outline">
                            {group.activePatientCount} pet
                            {group.activePatientCount > 1 ? "s" : ""}
                          </Badge>
                          <Badge variant="outline">Sessões em andamento</Badge>
                        </div>
                      </div>
                      {group.activeAlertCount > 0 ? (
                        <Badge variant="destructive">
                          {group.activeAlertCount} alerta
                          {group.activeAlertCount > 1 ? "s" : ""}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Sem alertas</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 pt-4">
                    <div className="grid max-h-72 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
                      {group.patients.map((patient) => {
                        const SpeciesIcon = getSpeciesIcon(patient.species);

                        return (
                          <Link
                            key={patient.sessionId}
                            to={`/treatments/${patient.sessionId}`}
                            className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-background p-3 transition-colors hover:border-primary/40 hover:bg-muted/30"
                          >
                            <div className="relative shrink-0">
                              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                                <SpeciesIcon className="h-5 w-5" />
                              </div>
                              {patient.hasAlert ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-background bg-destructive" />
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="top"
                                    sideOffset={8}
                                    className="max-w-64 space-y-1 px-3 py-2 text-left"
                                  >
                                    <p className="font-medium">
                                      {patient.alertCount} alerta
                                      {patient.alertCount > 1 ? "s" : ""} ativo
                                      {patient.alertCount > 1 ? "s" : ""}
                                    </p>
                                    {patient.latestAlertMessage ? (
                                      <p className="text-[11px] leading-relaxed text-background/80">
                                        {patient.latestAlertMessage}
                                      </p>
                                    ) : null}
                                    {patient.latestAlertCreatedAt ? (
                                      <p className="text-[10px] uppercase tracking-[0.08em] text-background/60">
                                        {formatAlertTimestamp(
                                          patient.latestAlertCreatedAt,
                                        )}
                                      </p>
                                    ) : null}
                                  </TooltipContent>
                                </Tooltip>
                              ) : null}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium leading-none transition-colors group-hover:text-primary">
                                {patient.patientName}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {patient.species || "Espécie não informada"}
                              </p>
                              {patient.hasAlert &&
                              patient.latestAlertMessage ? (
                                <p className="mt-1 truncate text-[11px] text-destructive/80">
                                  {patient.latestAlertMessage}
                                </p>
                              ) : null}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : null}
      </div>
    </PageLayout>
  );
}
