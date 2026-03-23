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
  IconUser,
  IconChevronDown,
  IconChevronUp,
  IconPaw,
} from "@tabler/icons-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { themeAccentClasses } from "@/lib/theme-styles";

export default function TutorDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: owner, isLoading } = useOwner(id || "");
  const [tutorInfoCollapsed, setTutorInfoCollapsed] = useState(true);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <PageLayout title="Carregando...">
        <div className="space-y-4">
          <div className="h-[120px] rounded-xl bg-muted/50 animate-pulse" />
        </div>
      </PageLayout>
    );
  }

  if (!owner || !id) {
    return (
      <PageLayout title="Tutor não encontrado">
        <div>O tutor solicitado não foi encontrado.</div>
      </PageLayout>
    );
  }

  const patients = owner.patients || [];

  return (
    <PageLayout title={`Tutor: ${owner.first_name} ${owner.last_name}`}>
      <div className="space-y-6">
        {/* Tutor Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div
                className={`rounded-lg p-2 ${themeAccentClasses.chart5.icon}`}
              >
                <IconUser className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Informações do Tutor</CardTitle>
                <CardDescription>Dados pessoais e de contato</CardDescription>
              </div>
            </div>
            <CardAction>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTutorInfoCollapsed(!tutorInfoCollapsed)}
              >
                {tutorInfoCollapsed ? (
                  <IconChevronDown className="h-4 w-4" />
                ) : (
                  <IconChevronUp className="h-4 w-4" />
                )}
              </Button>
            </CardAction>
          </CardHeader>
          {!tutorInfoCollapsed && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Nome Completo
                  </span>
                  <span className="font-medium text-lg">
                    {owner.first_name} {owner.last_name}
                  </span>
                </div>

                <div className="flex flex-col space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    E-mail
                  </span>
                  <span className="font-medium">{owner.email}</span>
                </div>

                <div className="flex flex-col space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Telefone
                  </span>
                  <span className="font-medium">{owner.phone || "-"}</span>
                </div>

                <div className="flex flex-col space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    CPF
                  </span>
                  <span className="font-medium">{owner.cpf || "-"}</span>
                </div>

                <div className="flex flex-col space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Total de Pacientes
                  </span>
                  <span className="font-medium text-lg">{patients.length}</span>
                </div>

                <div className="flex flex-col space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Cadastrado em
                  </span>
                  <span className="text-sm">
                    {new Date(owner.created_at).toLocaleString("pt-BR", {
                      dateStyle: "long",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Associated Patients */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div
                className={`rounded-lg p-2 ${themeAccentClasses.chart1.icon}`}
              >
                <IconPaw className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Pacientes</CardTitle>
                <CardDescription>
                  {patients.length}{" "}
                  {patients.length === 1
                    ? "paciente cadastrado"
                    : "pacientes cadastrados"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {patients.length > 0 ? (
              <div className="rounded-md border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Espécie</TableHead>
                      <TableHead>Raça</TableHead>
                      <TableHead>Idade</TableHead>
                      <TableHead>Peso</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.map((patient) => (
                      <TableRow
                        key={patient.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/patients/${patient.id}`)}
                      >
                        <TableCell className="font-medium">
                          {patient.name}
                        </TableCell>
                        <TableCell>{patient.species}</TableCell>
                        <TableCell>{patient.breed || "-"}</TableCell>
                        <TableCell>
                          {patient.age_years ? `${patient.age_years} anos` : ""}
                          {patient.age_years && patient.age_months ? " e " : ""}
                          {patient.age_months
                            ? `${patient.age_months} meses`
                            : ""}
                          {!patient.age_years && !patient.age_months ? "-" : ""}
                        </TableCell>
                        <TableCell>
                          {patient.weight_kg ? `${patient.weight_kg} kg` : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
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
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>Nenhum paciente cadastrado.</p>
                <p className="text-sm mt-2">
                  Os pacientes vinculados a este tutor aparecerão aqui.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
