import { useNavigate, useParams } from "react-router-dom";
import { useOwner } from "@/api/owners";
import { PageLayout } from "@/components/layout/page-layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  CatIcon,
  ChevDIcon,
  DogIcon,
  MailIcon,
  PawIcon,
  PhoneIcon,
} from "@/components/icons/vetdata-icons";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { toCatalogSpecies } from "@/lib/species";
import { cn } from "@/lib/utils";

function SpeciesIcon({ species }: { species: string }) {
  const key = toCatalogSpecies(species);
  if (key === "dog") return <DogIcon size={16} />;
  if (key === "cat") return <CatIcon size={16} />;
  return <PawIcon size={16} />;
}

export default function TutorDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: owner, isLoading } = useOwner(id || "");
  const [tutorInfoCollapsed, setTutorInfoCollapsed] = useState(true);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <PageLayout title="Carregando...">
        <div className="space-y-4">
          <Skeleton className="h-[120px] rounded-xl" />
        </div>
      </PageLayout>
    );
  }

  if (!owner || !id) {
    return (
      <PageLayout title="Tutor não encontrado">
        <p className="text-sm text-muted-foreground">
          O tutor solicitado não foi encontrado.
        </p>
      </PageLayout>
    );
  }

  const patients = owner.patients || [];
  const initials =
    `${owner.first_name?.[0] ?? ""}${owner.last_name?.[0] ?? ""}`.toUpperCase();
  const createdAt = new Date(owner.created_at).toLocaleString("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <PageLayout>
      <div className="flex flex-col gap-6">
        <header className="flex items-center gap-5">
          <span className="grid size-[72px] shrink-0 place-items-center rounded-full bg-mint-300 text-2xl font-semibold text-forest-900">
            {initials || <PawIcon size={24} />}
          </span>
          <div className="flex min-w-0 flex-col gap-1.5">
            <h1 className="text-2xl font-semibold tracking-[-0.01em] text-balance">
              {owner.first_name} {owner.last_name}
            </h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[13.5px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <MailIcon size={14} />
                {owner.email || "—"}
              </span>
              <span className="inline-flex items-center gap-1.5 tabular-nums">
                <PhoneIcon size={14} />
                {owner.phone || "—"}
              </span>
              <span className="inline-flex items-center gap-1.5 tabular-nums">
                <PawIcon size={14} />
                {patients.length}{" "}
                {patients.length === 1 ? "paciente" : "pacientes"}
              </span>
            </div>
          </div>
        </header>

        {/* Tutor Information */}
        <Card className={cn(!tutorInfoCollapsed && "gap-4")}>
          <CardHeader>
            <CardTitle className="text-base">Informações do tutor</CardTitle>
            <CardDescription>Dados pessoais e de contato</CardDescription>
            <CardAction>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={
                  tutorInfoCollapsed
                    ? "Mostrar informações"
                    : "Ocultar informações"
                }
                onClick={() => setTutorInfoCollapsed(!tutorInfoCollapsed)}
              >
                <ChevDIcon
                  className={cn(
                    "transition-transform duration-150",
                    !tutorInfoCollapsed && "rotate-180",
                  )}
                />
              </Button>
            </CardAction>
          </CardHeader>
          {!tutorInfoCollapsed && (
            <CardContent>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-4 border-t border-border pt-4 md:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <dt className="text-[13px] font-semibold">Nome completo</dt>
                  <dd className="text-sm text-stone-700">
                    {owner.first_name} {owner.last_name}
                  </dd>
                </div>

                <div className="flex flex-col gap-1">
                  <dt className="text-[13px] font-semibold">E-mail</dt>
                  <dd className="text-sm text-stone-700">
                    {owner.email || "—"}
                  </dd>
                </div>

                <div className="flex flex-col gap-1">
                  <dt className="text-[13px] font-semibold">Telefone</dt>
                  <dd className="text-sm text-stone-700 tabular-nums">
                    {owner.phone || "—"}
                  </dd>
                </div>

                <div className="flex flex-col gap-1">
                  <dt className="text-[13px] font-semibold">CPF</dt>
                  <dd className="font-mono text-sm text-stone-700">
                    {owner.cpf || "—"}
                  </dd>
                </div>

                <div className="flex flex-col gap-1">
                  <dt className="text-[13px] font-semibold">
                    Total de pacientes
                  </dt>
                  <dd className="text-sm text-stone-700 tabular-nums">
                    {patients.length}
                  </dd>
                </div>

                <div className="flex flex-col gap-1">
                  <dt className="text-[13px] font-semibold">Cadastrado em</dt>
                  <dd className="inline-flex items-center gap-1.5 text-sm text-stone-700">
                    <CalendarIcon size={14} className="text-muted-foreground" />
                    {createdAt}
                  </dd>
                </div>
              </dl>
            </CardContent>
          )}
        </Card>

        {/* Associated Patients */}
        <Card className="gap-0 py-0">
          <CardHeader className="border-b py-4">
            <CardTitle className="text-base">Pacientes</CardTitle>
            <CardDescription>
              {patients.length}{" "}
              {patients.length === 1
                ? "paciente cadastrado"
                : "pacientes cadastrados"}
            </CardDescription>
          </CardHeader>
          {patients.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Espécie</TableHead>
                  <TableHead className="text-right">Idade</TableHead>
                  <TableHead className="text-right">Peso</TableHead>
                  <TableHead className="text-right">
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow
                    key={patient.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/patients/${patient.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-mint-300 text-forest-900">
                          <SpeciesIcon species={patient.species} />
                        </span>
                        <div className="flex min-w-0 flex-col">
                          <span className="font-semibold text-foreground">
                            {patient.name}
                          </span>
                          <span className="text-[12.5px] text-muted-foreground">
                            {patient.breed || "—"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{patient.species || "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {patient.age_years ? `${patient.age_years} anos` : ""}
                      {patient.age_years && patient.age_months ? " e " : ""}
                      {patient.age_months ? `${patient.age_months} meses` : ""}
                      {!patient.age_years && !patient.age_months ? (
                        <span className="text-stone-500">—</span>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {patient.weight_kg ? (
                        <>
                          {patient.weight_kg.toLocaleString("pt-BR")}
                          <span className="ml-[3px] text-muted-foreground">
                            kg
                          </span>
                        </>
                      ) : (
                        <span className="text-stone-500">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/patients/${patient.id}`);
                        }}
                      >
                        Ver detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
              <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
                <PawIcon size={20} />
              </span>
              <h4 className="text-sm font-semibold">
                Nenhum paciente cadastrado
              </h4>
              <p className="text-[13.5px] text-muted-foreground">
                Os pacientes vinculados a este tutor aparecerão aqui.
              </p>
            </div>
          )}
        </Card>
      </div>
    </PageLayout>
  );
}
