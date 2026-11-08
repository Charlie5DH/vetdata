import type { ComponentType } from "react";
import { Link } from "react-router-dom";
import {
  AlertIcon,
  AppointmentIcon,
  ChevRIcon,
  HeartPulseIcon,
  PawIcon,
  PlusIcon,
  RecordIcon,
  StethoscopeIcon,
  SyringeIcon,
  UsersIcon,
  CalendarIcon,
  type IconProps,
} from "@/components/icons/vetdata-icons";

import { PageLayout } from "@/components/layout/page-layout";
import { useRecentEvents } from "@/api/events";
import { usePatients } from "@/api/patients";
import { useOwners } from "@/api/owners";
import { useTreatmentSessions } from "@/api/treatments";
import { ActiveMonitoringChart } from "@/components/dashboard/active-monitoring-chart";
import { PetAvatar } from "@/components/patients/pet-avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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

const EVENT_TYPE_ICONS: Record<string, ComponentType<IconProps>> = {
  patient_created: PawIcon,
  patient_updated: PawIcon,
  treatment_session_created: StethoscopeIcon,
  treatment_session_completed: StethoscopeIcon,
  treatment_alert_triggered: AlertIcon,
  treatment_log_added: RecordIcon,
  treatment_log_deleted: RecordIcon,
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
  const { data: owners, isLoading: isLoadingOwners } = useOwners();
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
      title: "Total de pacientes",
      value: patients?.length || 0,
      icon: PawIcon,
      loading: isLoadingPatients,
    },
    {
      title: "Total de tutores",
      value: owners?.length || 0,
      icon: UsersIcon,
      loading: isLoadingOwners,
    },
    {
      title: "Tratamentos ativos",
      value: sessions?.filter((s) => s.status === "active").length || 0,
      icon: StethoscopeIcon,
      loading: isLoadingSessions,
    },
    {
      title: "Total de sessões",
      value: sessions?.length || 0,
      icon: CalendarIcon,
      loading: isLoadingSessions,
    },
  ];

  return (
    <PageLayout title="Painel" description={today}>
      <div className="w-full">

        {hasNoPatients ? (
          <EmptyHero clinicPath={clinicPath} />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.title}
                  className="flex flex-col gap-1.5 rounded-xl border border-border bg-card p-5"
                >
                  <div className="flex items-center justify-between text-[13px] text-muted-foreground">
                    {stat.title}
                    <stat.icon size={14} className="text-stone-500" />
                  </div>
                  <div className="text-[28px] leading-tight font-semibold tracking-[-0.02em] tabular-nums">
                    {stat.loading ? "—" : stat.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <section className="col-span-4 flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
                <h2 className="text-base font-semibold">Atividade recente</h2>
                <div className="-mx-2 flex flex-col gap-0.5">
                  {isLoadingEvents && (
                    <div className="flex flex-col gap-2 px-2">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <Skeleton
                          key={`event-skeleton-${index + 1}`}
                          className="h-14 rounded-lg"
                        />
                      ))}
                    </div>
                  )}
                  {!isLoadingEvents && events?.length
                    ? events.map((event) => {
                        const patientName = event.patient?.name ?? "Paciente";
                        const eventLabel =
                          EVENT_TYPE_LABELS[event.event_type] ?? event.title;
                        const EventIcon =
                          EVENT_TYPE_ICONS[event.event_type] ?? HeartPulseIcon;
                        const isAlert =
                          event.event_type === "treatment_alert_triggered";

                        return (
                          <div
                            key={event.id}
                            className="relative flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors duration-150 hover:bg-muted"
                          >
                            <Link
                              to={`/patients/${event.patient_id}`}
                              aria-label={`Abrir paciente ${patientName}`}
                              className="absolute inset-0 z-10 rounded-lg"
                            />
                            <span
                              className={
                                isAlert
                                  ? "pointer-events-none relative z-20 grid size-8 shrink-0 place-items-center rounded-full bg-destructive-soft text-destructive"
                                  : "pointer-events-none relative z-20 grid size-8 shrink-0 place-items-center rounded-full bg-muted text-foreground"
                              }
                            >
                              <EventIcon size={16} />
                            </span>
                            <div className="pointer-events-none relative z-20 min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                  <p className="text-[13.5px] font-semibold">
                                    {patientName}
                                    <span className="font-normal text-muted-foreground">
                                      {" "}
                                      · {eventLabel}
                                    </span>
                                  </p>
                                  {event.patient?.owner?.id ? (
                                    <Link
                                      to={`/tutors/${event.patient.owner.id}`}
                                      className="pointer-events-auto text-[12.5px] text-muted-foreground transition-colors hover:text-foreground hover:underline"
                                    >
                                      Tutor: {event.patient.owner.first_name}{" "}
                                      {event.patient.owner.last_name}
                                    </Link>
                                  ) : null}
                                </div>
                                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                                  {new Date(event.occurred_at).toLocaleString(
                                    "pt-BR",
                                    {
                                      day: "2-digit",
                                      month: "2-digit",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )}
                                </span>
                              </div>
                              {event.description ? (
                                <p className="mt-0.5 text-[13px] text-stone-700">
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
              </section>

              <section className="col-span-3 flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
                <h2 className="text-base font-semibold">Pacientes ativos</h2>
                <div className="-mx-2 flex flex-col gap-0.5">
                  {activePatients.map((patient) => (
                    <Link
                      key={patient.id}
                      to={`/patients/${patient.id}`}
                      className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors duration-150 hover:bg-muted"
                    >
                      <PetAvatar species={patient.species} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-semibold">
                          {patient.name}
                        </p>
                        <p className="truncate text-[12.5px] text-muted-foreground">
                          {patient.species} · {patient.breed}
                        </p>
                      </div>
                      <div className="shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                        Em tratamento desde{" "}
                        {new Date(patient.started_at).toLocaleDateString(
                          "pt-BR",
                        )}
                      </div>
                    </Link>
                  ))}
                  {!isLoadingSessions && activePatients.length === 0 && (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      Nenhum paciente com tratamento ativo
                    </div>
                  )}
                </div>
              </section>
            </div>

            <section className="mt-6 flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
              <h2 className="text-base font-semibold">
                Métricas em monitoramento
              </h2>
              <ActiveMonitoringChart
                sessions={sessions}
                isLoading={isLoadingSessions}
              />
            </section>
          </>
        )}
      </div>
    </PageLayout>
  );
}

function EmptyHero({ clinicPath }: { clinicPath: (path?: string) => string }) {
  return (
    <>
      <section className="rounded-xl border border-border bg-card px-6 py-8 sm:px-8">
        <p className="mb-2 text-[13px] font-semibold text-muted-foreground">
          Comece por aqui
        </p>

        <h2 className="mb-2 max-w-[34ch] text-xl font-semibold text-foreground">
          Sua clínica em um lugar — comece cadastrando os primeiros pacientes.
        </h2>

        <p className="mb-5 max-w-[60ch] text-sm leading-[1.6] text-stone-700">
          O painel ainda está em branco. Cadastre o primeiro paciente e seu
          tutor, depois monte modelos com as medidas que você acompanha. Por
          fim, abra um tratamento e registre os atendimentos ao longo da sessão.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="cta">
            <Link to={clinicPath("/patients/new")}>
              <PlusIcon />
              Criar primeiro paciente
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={clinicPath("/tutors/new")}>Cadastrar tutor</Link>
          </Button>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-y-5 border-t border-border pt-6 md:grid-cols-[1fr_24px_1fr_24px_1fr]">
          {stepItems.map((step, index) => (
            <div key={step.n} className="contents">
              <div className="flex flex-col gap-1.5 px-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <span className="grid size-[22px] place-items-center rounded-full bg-muted text-xs font-semibold text-foreground tabular-nums">
                    {step.n}
                  </span>
                  {step.eyebrow}
                </div>
                <h3 className="text-[15px] font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-[13.5px] leading-[1.55] text-muted-foreground">
                  {step.description}
                </p>
              </div>
              {index < stepItems.length - 1 ? (
                <div className="hidden place-items-center text-stone-400 md:grid">
                  <ChevRIcon size={16} />
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-4 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            Acesse diretamente:
          </span>
          <div className="ml-auto flex flex-wrap gap-1">
            <QuickLink to={clinicPath("/treatments")} icon={StethoscopeIcon}>
              Tratamentos
            </QuickLink>
            <QuickLink to={clinicPath("/templates")} icon={RecordIcon}>
              Modelos
            </QuickLink>
            <QuickLink to={clinicPath("/measures")} icon={HeartPulseIcon}>
              Medidas
            </QuickLink>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <EmptyPanel
          title="Próximos atendimentos"
          linkLabel="Ver agenda"
          linkTo={clinicPath("/treatments")}
          headline="Nenhum atendimento agendado."
          dim="A agenda aparece aqui assim que o primeiro tratamento for iniciado."
          ctaLabel="Iniciar tratamento"
          ctaTo={clinicPath("/treatments/new")}
        />
        <EmptyPanel
          title="Vacinas a vencer"
          linkLabel="Ver catálogo"
          linkTo={clinicPath("/vaccines/catalog")}
          headline="Nenhuma vacina próxima do vencimento."
          dim="Após cadastrar pacientes e suas vacinas, alertas aparecem aqui automaticamente."
          ctaLabel="Cadastrar primeira vacina"
          ctaTo={clinicPath("/vaccines")}
          icon={SyringeIcon}
        />
      </section>
    </>
  );
}

function QuickLink({
  to,
  icon: Icon,
  children,
}: {
  to: string;
  icon: ComponentType<IconProps>;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="inline-flex h-[30px] items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-foreground transition-colors duration-150 hover:bg-muted"
    >
      <Icon size={14} className="text-muted-foreground" />
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
  icon?: ComponentType<IconProps>;
};

function EmptyPanel({
  title,
  linkLabel,
  linkTo,
  headline,
  dim,
  ctaLabel,
  ctaTo,
  icon: Icon = AppointmentIcon,
}: EmptyPanelProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <Link
          to={linkTo}
          className="inline-flex items-center gap-1 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
        >
          {linkLabel}
          <ChevRIcon size={12} />
        </Link>
      </div>
      <div className="flex flex-col items-start gap-1.5">
        <span className="mb-1 grid size-12 place-items-center rounded-full bg-muted text-foreground">
          <Icon size={20} />
        </span>
        <p className="text-sm font-semibold text-foreground">{headline}</p>
        <p className="text-[13px] text-muted-foreground">{dim}</p>
        <Button asChild variant="link" size="sm" className="mt-1">
          <Link to={ctaTo}>
            {ctaLabel}
            <ChevRIcon />
          </Link>
        </Button>
      </div>
    </div>
  );
}
