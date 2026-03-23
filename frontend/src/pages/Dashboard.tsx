import { PageLayout } from "@/components/layout/page-layout";
import { useRecentEvents } from "@/api/events";
import { usePatients } from "@/api/patients";
import { useOwners } from "@/api/owners";
import { useTreatmentSessions } from "@/api/treatments";
import { ActiveMonitoringChart } from "@/components/dashboard/active-monitoring-chart";
import { themeAccentClasses } from "@/lib/theme-styles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  IconArrowRight,
  IconUsers,
  IconPaw,
  IconStethoscope,
  IconCalendarEvent,
  IconActivity,
  IconFileText,
  IconRulerMeasure,
} from "@tabler/icons-react";
import { useClinicPath } from "@/lib/clinic-routes";

const EVENT_TYPE_LABELS: Record<string, string> = {
  patient_created: "Paciente cadastrado",
  patient_updated: "Paciente atualizado",
  treatment_session_created: "Tratamento iniciado",
  treatment_session_completed: "Tratamento concluído",
  treatment_alert_triggered: "Alerta clínico disparado",
  treatment_log_added: "Registro adicionado",
  treatment_log_deleted: "Registro removido",
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { clinicPath } = useClinicPath();
  const { data: patients, isLoading: isLoadingPatients } = usePatients();
  const { data: owners } = useOwners();
  const { data: sessions, isLoading: isLoadingSessions } =
    useTreatmentSessions();
  const { data: events, isLoading: isLoadingEvents } = useRecentEvents();
  const hasNoPatients = !isLoadingPatients && (patients?.length ?? 0) === 0;

  const activePatients = Array.from(
    new Map(
      (sessions ?? [])
        .filter((session) => session.status === "active")
        .map((session) => {
          const patient = session.patient;

          return [
            patient?.id ?? session.patient_id,
            {
              id: patient?.id ?? session.patient_id,
              name: patient?.name ?? "Paciente sem nome",
              species: patient?.species ?? "-",
              breed: patient?.breed ?? "-",
              started_at: session.started_at,
            },
          ] as const;
        }),
    ).values(),
  ).slice(0, 5);

  const stats = [
    {
      title: "Total de Pacientes",
      value: patients?.length || 0,
      icon: IconPaw,
      accent: themeAccentClasses.chart1.stat,
    },
    {
      title: "Total de Tutores",
      value: owners?.length || 0,
      icon: IconUsers,
      accent: themeAccentClasses.primary.stat,
    },
    {
      title: "Tratamentos Ativos",
      value: sessions?.filter((s) => s.status === "active").length || 0,
      icon: IconStethoscope,
      accent: themeAccentClasses.chart5.stat,
    },
    {
      title: "Total de Sessões",
      value: sessions?.length || 0,
      icon: IconCalendarEvent,
      accent: themeAccentClasses.chart2.stat,
    },
  ];

  return (
    <PageLayout title="Painel">
      {hasNoPatients && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Empty className="items-start rounded-2xl border border-primary/20 bg-linear-to-r from-primary/8 via-primary/5 to-background p-6 text-left md:p-8">
            <EmptyHeader className="max-w-2xl items-start text-left">
              <EmptyMedia variant="icon" className="bg-primary/12 text-primary">
                <IconPaw className="size-5" />
              </EmptyMedia>
              <EmptyTitle>Comece cadastrando os primeiros pacientes</EmptyTitle>
              <EmptyDescription>
                Seu Painel ainda esta no inicio. Primeiro cadastre o paciente e
                o tutor. Depois organize como o atendimento sera feito com
                modelos e medidas. Por fim, inicie um tratamento e registre os
                acompanhamentos ao longo da sessao.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="max-w-none items-start text-left">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button asChild>
                  <Link to={clinicPath("/patients/new")}>
                    <IconPaw data-icon="inline-start" />
                    Criar primeiro paciente
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to={clinicPath("/tutors/new")}>
                    <IconUsers data-icon="inline-start" />
                    Cadastrar tutor
                  </Link>
                </Button>
              </div>
              <div className="grid w-full gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-stretch">
                <div className="rounded-xl border border-border/60 bg-background/80 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <IconPaw className="size-4 text-primary" />
                    1. Paciente e tutor
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Cadastre primeiro o paciente e vincule o tutor responsavel
                    para ter a base do atendimento.
                  </p>
                </div>
                <div className="hidden min-w-14 items-center justify-center md:flex">
                  <div className="flex items-center gap-2 text-primary/55">
                    <div className="h-px w-6 bg-primary/25" />
                    <IconArrowRight className="size-4" />
                    <div className="h-px w-6 bg-primary/25" />
                  </div>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/80 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <IconFileText className="size-4 text-primary" />
                    2. Modelos e medidas
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Monte o modelo do tratamento e defina quais medidas devem
                    ser monitoradas durante a sessao.
                  </p>
                </div>
                <div className="hidden min-w-14 items-center justify-center md:flex">
                  <div className="flex items-center gap-2 text-primary/55">
                    <div className="h-px w-6 bg-primary/25" />
                    <IconArrowRight className="size-4" />
                    <div className="h-px w-6 bg-primary/25" />
                  </div>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/80 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <IconStethoscope className="size-4 text-primary" />
                    3. Tratamento e registros
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Inicie o tratamento do paciente, selecione o modelo e va
                    adicionando os registros das medidas acompanhadas.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>Acesse diretamente:</span>
                <Button asChild variant="link" className="h-auto px-0 text-sm">
                  <Link to={clinicPath("/treatments")}>
                    Tratamentos
                    <IconArrowRight data-icon="inline-end" />
                  </Link>
                </Button>
                <Button asChild variant="link" className="h-auto px-0 text-sm">
                  <Link to={clinicPath("/templates")}>
                    <IconFileText data-icon="inline-start" />
                    Modelos
                  </Link>
                </Button>
                <Button asChild variant="link" className="h-auto px-0 text-sm">
                  <Link to={clinicPath("/measures")}>
                    <IconRulerMeasure data-icon="inline-start" />
                    Medidas
                  </Link>
                </Button>
              </div>
            </EmptyContent>
          </Empty>
        </motion.div>
      )}
      {!hasNoPatients && (
        <>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          >
            {stats.map((stat) => (
              <motion.div key={stat.title} variants={item}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <div className={`rounded-md p-2 ${stat.accent}`}>
                      <stat.icon className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      +0% em relação ao mês anterior
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="col-span-4"
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Atividade Recente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isLoadingEvents && (
                      <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, index) => (
                          <div
                            key={`event-skeleton-${index + 1}`}
                            className="h-16 rounded-xl bg-muted/50 animate-pulse"
                          />
                        ))}
                      </div>
                    )}
                    {!isLoadingEvents && events?.length
                      ? events.map((event) => {
                          const patientName = event.patient?.name ?? "Paciente";
                          const eventLabel =
                            EVENT_TYPE_LABELS[event.event_type] ?? event.title;

                          return (
                            <div
                              key={event.id}
                              className="relative flex items-start gap-4 rounded-xl border border-border/60 bg-muted/20 p-4 transition-colors hover:border-primary/40 hover:bg-muted/35"
                            >
                              <Link
                                to={`/patients/${event.patient_id}`}
                                aria-label={`Abrir paciente ${patientName}`}
                                className="absolute inset-0 z-10 rounded-xl"
                              />
                              <div className="relative z-20 rounded-lg bg-primary/10 p-2 text-primary pointer-events-none">
                                <IconActivity className="h-4 w-4" />
                              </div>
                              <div className="relative z-20 min-w-0 flex-1 space-y-1 pointer-events-none">
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <p className="text-sm font-medium leading-none">
                                      {patientName}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                      {eventLabel}
                                    </p>
                                    {event.patient?.owner?.id ? (
                                      <Link
                                        to={`/tutors/${event.patient.owner.id}`}
                                        className="pointer-events-auto mt-1 inline-flex text-xs text-muted-foreground transition-colors hover:text-primary"
                                      >
                                        Tutor: {event.patient.owner.first_name}{" "}
                                        {event.patient.owner.last_name}
                                      </Link>
                                    ) : null}
                                  </div>
                                  <span className="shrink-0 text-xs text-muted-foreground">
                                    {new Date(
                                      event.occurred_at,
                                    ).toLocaleString()}
                                  </span>
                                </div>
                                {event.description ? (
                                  <p className="text-sm text-muted-foreground">
                                    {event.description}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          );
                        })
                      : null}
                    {!isLoadingEvents && !events?.length && (
                      <div className="flex h-50 items-center justify-center text-sm text-muted-foreground">
                        Nenhuma atividade recente encontrada.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="col-span-3"
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Pacientes ativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activePatients.map((patient) => (
                      <div key={patient.id} className="flex items-center gap-4">
                        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                          <IconPaw className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <Link
                            to={`/patients/${patient.id}`}
                            className="text-sm font-medium leading-none transition-colors hover:text-primary"
                          >
                            {patient.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {patient.species} • {patient.breed}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Em tratamento desde{" "}
                          {new Date(patient.started_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                    {!isLoadingSessions && activePatients.length === 0 && (
                      <div className="text-center text-sm text-muted-foreground py-8">
                        Nenhum paciente com tratamento ativo
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-8"
          >
            <Card>
              <CardHeader>
                <CardTitle>Métricas em Monitoramento</CardTitle>
              </CardHeader>
              <CardContent>
                <ActiveMonitoringChart
                  sessions={sessions}
                  isLoading={isLoadingSessions}
                />
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </PageLayout>
  );
}
