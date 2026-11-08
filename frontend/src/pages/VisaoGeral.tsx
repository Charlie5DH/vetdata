import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FilterIcon, HeartPulseIcon } from "@/components/icons/vetdata-icons";
import { PetAvatar } from "@/components/patients/pet-avatar";

import { useSessionsAlerts } from "@/api/alerts";
import { useTreatmentSessions } from "@/api/treatments";
import { PageLayout } from "@/components/layout/page-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
          <CardHeader className="gap-2">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((__, rowIndex) => (
              <Skeleton
                key={`overview-skeleton-row-${rowIndex + 1}`}
                className="h-14 rounded-lg"
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
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-4">
          <div className="flex items-center gap-2">
            <Label
              htmlFor="overview-only-alerts"
              className="text-[13px] font-medium text-muted-foreground"
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

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Label
              htmlFor="overview-species"
              className="text-[13px] font-medium text-muted-foreground"
            >
              Espécie
            </Label>
            <Select value={speciesFilter} onValueChange={setSpeciesFilter}>
              <SelectTrigger
                id="overview-species"
                size="sm"
                className="w-full sm:min-w-44"
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

          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link to={clinicPath("/treatments")}>Ver sessões</Link>
          </Button>
        </div>
      }
    >
      <div>
        {isLoading ? <OverviewSkeleton /> : null}

        {!isLoading && !hasActiveData ? (
          <Card>
            <CardContent className="flex min-h-64 flex-col items-center justify-center gap-2 text-center">
              <span className="mb-1 grid size-12 place-items-center rounded-full bg-muted text-foreground">
                <HeartPulseIcon size={20} />
              </span>
              <h2 className="text-base font-semibold">
                Nenhum tratamento ativo
              </h2>
              <p className="max-w-lg text-sm text-muted-foreground">
                Quando a clínica tiver sessões em andamento, elas aparecerão
                aqui agrupadas por modelo de tratamento.
              </p>
              <Button asChild variant="cta" className="mt-2">
                <Link to={clinicPath("/treatments/new")}>
                  Iniciar tratamento
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && hasActiveData && filteredGroups.length === 0 ? (
          <Card>
            <CardContent className="flex min-h-64 flex-col items-center justify-center gap-2 text-center">
              <span className="mb-1 grid size-12 place-items-center rounded-full bg-muted text-foreground">
                <FilterIcon size={20} />
              </span>
              <h2 className="text-base font-semibold">
                Nenhum tratamento encontrado
              </h2>
              <p className="max-w-lg text-sm text-muted-foreground">
                Ajuste os filtros para ver sessões ativas de outras espécies ou
                incluir pets sem alertas.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && filteredGroups.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredGroups.map((group) => (
              <Card key={group.id} className="flex min-h-88 flex-col overflow-hidden">
                <CardHeader className="gap-3 border-b border-border">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1.5">
                      <CardTitle className="text-base font-semibold">
                        {group.treatmentName}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
                        <p className="tabular-nums">
                          Ativo desde {formatStartedAt(group.startedAt)}
                        </p>
                        <Badge variant="outline">
                          {group.activePatientCount} pet
                          {group.activePatientCount > 1 ? "s" : ""}
                        </Badge>
                        <Badge variant="outline">Sessões em andamento</Badge>
                      </div>
                    </div>
                    {group.activeAlertCount > 0 ? (
                      <Badge variant="destructive">
                        <span
                          aria-hidden
                          className="size-1.5 rounded-full bg-current"
                        />
                        {group.activeAlertCount} alerta
                        {group.activeAlertCount > 1 ? "s" : ""}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Sem alertas</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="grid max-h-72 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                    {group.patients.map((patient) => (
                      <Link
                        key={patient.sessionId}
                        to={`/treatments/${patient.sessionId}`}
                        className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 transition-colors duration-150 hover:bg-muted"
                      >
                        <div className="relative shrink-0">
                          <PetAvatar species={patient.species} className="size-9" />
                          {patient.hasAlert ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span
                                  aria-label="Paciente com alerta ativo"
                                  className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-destructive ring-2 ring-card"
                                />
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                sideOffset={8}
                                className="max-w-64 space-y-1 text-left"
                              >
                                <p className="font-semibold">
                                  {patient.alertCount} alerta
                                  {patient.alertCount > 1 ? "s" : ""} ativo
                                  {patient.alertCount > 1 ? "s" : ""}
                                </p>
                                {patient.latestAlertMessage ? (
                                  <p className="text-[11.5px] leading-relaxed opacity-85">
                                    {patient.latestAlertMessage}
                                  </p>
                                ) : null}
                                {patient.latestAlertCreatedAt ? (
                                  <p className="text-[11px] tabular-nums opacity-70">
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
                          <p className="truncate text-[13.5px] font-semibold">
                            {patient.patientName}
                          </p>
                          <p className="text-[12.5px] text-muted-foreground">
                            {patient.species || "Espécie não informada"}
                          </p>
                          {patient.hasAlert && patient.latestAlertMessage ? (
                            <p className="mt-0.5 truncate text-xs font-medium text-destructive">
                              {patient.latestAlertMessage}
                            </p>
                          ) : null}
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}
      </div>
    </PageLayout>
  );
}
