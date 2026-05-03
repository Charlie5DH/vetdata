import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  IconActivity,
  IconArrowRight,
  IconCalendarEvent,
  IconFileText,
  IconPaw,
  IconPlus,
  IconRulerMeasure,
  IconStethoscope,
  IconUsers,
  IconVaccine,
} from "@tabler/icons-react";

import { PageLayout } from "@/components/layout/page-layout";
import { useRecentEvents } from "@/api/events";
import { usePatients } from "@/api/patients";
import { useOwners } from "@/api/owners";
import { useTreatmentSessions } from "@/api/treatments";
import { ActiveMonitoringChart } from "@/components/dashboard/active-monitoring-chart";
import { themeAccentClasses } from "@/lib/theme-styles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function formatBrazilianDate(date: Date): string {
  const formatted = date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  // toLocaleDateString returns e.g. "sexta-feira, 2 de maio" — uppercase the
  // weekday and swap the comma for the editorial dot we use in the design.
  const capitalized = formatted.charAt(0).toUpperCase() + formatted.slice(1);
  return capitalized.replace(", ", " · ");
}

const stepItems = [
  {
    n: "1",
    eyebrow: "Paciente e tutor",
    title: "Comece pelo cadastro",
    description:
      "Cadastre o paciente e vincule o tutor responsável para ter a base do atendimento.",
  },
  {
    n: "2",
    eyebrow: "Modelos e medidas",
    title: "Monte seu modelo",
    description:
      "Defina quais medidas devem ser monitoradas durante a sessão, do peso à FC.",
  },
  {
    n: "3",
    eyebrow: "Tratamento e registros",
    title: "Acompanhe a sessão",
    description:
      "Inicie o tratamento, selecione o modelo e adicione os registros das medidas.",
  },
];

export default function Dashboard() {
  const { clinicPath } = useClinicPath();
  const { data: patients, isLoading: isLoadingPatients } = usePatients();
  const { data: owners } = useOwners();
  const { data: sessions, isLoading: isLoadingSessions } =
    useTreatmentSessions();
  const { data: events, isLoading: isLoadingEvents } = useRecentEvents();
  const hasNoPatients = !isLoadingPatients && (patients?.length ?? 0) === 0;

  const today = formatBrazilianDate(new Date());

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
    <PageLayout>
      <div className="mx-auto w-full max-w-[1080px]">
        {/* Editorial page head */}
        <div className="mb-9 flex items-baseline justify-between gap-4">
          <h1 className="font-[var(--theme-font-serif)] text-4xl md:text-[40px] leading-[1.1] tracking-tight font-normal text-card-foreground">
            Painel
          </h1>
          <div className="hidden text-sm text-muted-foreground sm:block">
            {today}
          </div>
        </div>

        {hasNoPatients ? (
          <EmptyHero clinicPath={clinicPath} />
        ) : (
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
                            const patientName =
                              event.patient?.name ?? "Paciente";
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
                        <div
                          key={patient.id}
                          className="flex items-center gap-4"
                        >
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
      </div>
    </PageLayout>
  );
}

function EmptyHero({ clinicPath }: { clinicPath: (path?: string) => string }) {
  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-9 sm:px-10 sm:py-10 md:px-11"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_240px_at_8%_0%,color-mix(in_oklab,var(--primary)_22%,transparent),transparent_60%)]"
        />
        <div className="relative">
          <div className="mb-3.5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.04em] text-muted-foreground">
            <span className="block h-px w-[18px] bg-primary" />
            Comece por aqui
          </div>

          <h2 className="mb-3 max-w-[30ch] font-[var(--theme-font-serif)] text-[28px] sm:text-[32px] leading-[1.15] tracking-tight font-normal text-card-foreground">
            Sua clínica em um lugar —{" "}
            <em className="italic text-primary">comece cadastrando</em> os
            primeiros pacientes.
          </h2>

          <p className="mb-6 max-w-[56ch] text-[15px] leading-[1.6] text-foreground">
            O painel ainda está em branco. Cadastre o primeiro paciente e seu
            tutor, depois monte modelos com as medidas que você acompanha. Por
            fim, abra um tratamento e registre os atendimentos ao longo da
            sessão.
          </p>

          <div className="mb-1 flex flex-wrap items-center gap-2.5">
            <Button asChild className="h-10 px-4">
              <Link to={clinicPath("/patients/new")}>
                <IconPlus className="size-3.5" />
                Criar primeiro paciente
              </Link>
            </Button>
            <Button asChild variant="secondary" className="h-10 px-4">
              <Link to={clinicPath("/tutors/new")}>Cadastrar tutor</Link>
            </Button>
          </div>

          <div className="mt-2 grid grid-cols-1 gap-y-5 border-t border-border pt-7 md:grid-cols-[1fr_24px_1fr_24px_1fr]">
            {stepItems.map((step, index) => (
              <div key={step.n} className="contents">
                <div className="flex flex-col gap-2.5 px-1">
                  <div className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
                    <span className="grid size-[22px] place-items-center rounded-full bg-secondary font-[var(--theme-font-serif)] text-[13px] italic font-normal text-foreground">
                      {step.n}
                    </span>
                    {step.eyebrow}
                  </div>
                  <h3 className="text-[15px] font-semibold tracking-tight text-card-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-[1.55] text-muted-foreground">
                    {step.description}
                  </p>
                </div>
                {index < stepItems.length - 1 ? (
                  <div className="hidden place-items-center text-foreground/35 md:grid">
                    <IconArrowRight className="size-4" />
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-border pt-5 text-sm text-muted-foreground">
            <strong className="font-medium text-foreground">
              Acesse diretamente:
            </strong>
            <div className="ml-auto flex flex-wrap gap-1">
              <QuickLink to={clinicPath("/treatments")} icon={IconStethoscope}>
                Tratamentos
              </QuickLink>
              <QuickLink to={clinicPath("/templates")} icon={IconFileText}>
                Modelos
              </QuickLink>
              <QuickLink to={clinicPath("/measures")} icon={IconRulerMeasure}>
                Medidas
              </QuickLink>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-12 grid gap-6 md:grid-cols-2"
      >
        <EmptyPanel
          title="Próximos atendimentos"
          linkLabel="Ver agenda →"
          linkTo={clinicPath("/treatments")}
          headline="Nenhum atendimento agendado."
          dim="A agenda aparece aqui assim que o primeiro tratamento for iniciado."
          ctaLabel="Iniciar tratamento"
          ctaTo={clinicPath("/treatments/new")}
        />
        <EmptyPanel
          title="Vacinas a vencer"
          linkLabel="Ver catálogo →"
          linkTo={clinicPath("/vaccines/catalog")}
          headline="Nenhuma vacina próxima do vencimento."
          dim="Após cadastrar pacientes e suas vacinas, alertas aparecem aqui automaticamente."
          ctaLabel="Cadastrar primeira vacina"
          ctaTo={clinicPath("/vaccines")}
          icon={IconVaccine}
        />
      </motion.section>
    </>
  );
}

function QuickLink({
  to,
  icon: Icon,
  children,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-foreground transition-colors hover:bg-secondary"
    >
      <Icon className="size-3.5 text-muted-foreground" />
      {children}
    </Link>
  );
}

type EmptyPanelProps = {
  title: string;
  linkLabel: string;
  linkTo: string;
  headline: string;
  dim: string;
  ctaLabel: string;
  ctaTo: string;
  icon?: React.ComponentType<{ className?: string }>;
};

function EmptyPanel({
  title,
  linkLabel,
  linkTo,
  headline,
  dim,
  ctaLabel,
  ctaTo,
}: EmptyPanelProps) {
  return (
    <div className="rounded-[14px] border border-border bg-card px-6 py-6 sm:px-7 sm:py-7">
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <h3 className="font-[var(--theme-font-serif)] text-[22px] font-normal tracking-tight text-card-foreground">
          {title}
        </h3>
        <Link
          to={linkTo}
          className="text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          {linkLabel}
        </Link>
      </div>
      <div className="flex flex-col items-start gap-2 px-1 pt-3.5 pb-2 text-[13.5px] leading-[1.6] text-muted-foreground">
        <div
          aria-hidden="true"
          className="mb-1 flex gap-1.5 text-foreground/40"
        >
          <span className="block h-0.5 w-7 rounded-sm bg-current opacity-50" />
          <span className="block h-0.5 w-4 rounded-sm bg-current opacity-30" />
          <span className="block h-0.5 w-2.5 rounded-sm bg-current opacity-20" />
        </div>
        <div>{headline}</div>
        <div className="text-xs text-muted-foreground/70">{dim}</div>
        <Link
          to={ctaTo}
          className="mt-2.5 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          {ctaLabel}
          <IconArrowRight className="size-3" />
        </Link>
      </div>
    </div>
  );
}
