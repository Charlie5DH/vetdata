import { useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { useCurrentUser } from "@/api/auth";
import { useMyClinic, useUpdateMyClinic } from "@/api/clinics";
import { PageLayout } from "@/components/layout/page-layout";
import { ClinicIcon, UsersIcon } from "@/components/icons/vetdata-icons";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClinicForm, clinicToFormValues } from "@/pages/clinic/clinic-form";
import type { ClinicCreatePayload } from "@/types";
import { useClinicPath } from "@/lib/clinic-routes";

export default function ClinicProfilePage() {
  const currentUserQuery = useCurrentUser();
  const clinicQuery = useMyClinic();
  const updateClinic = useUpdateMyClinic();
  const { clinicPath } = useClinicPath();

  const canEdit = currentUserQuery.data?.clinic_role === "clinic_owner";
  const initialValues = useMemo(
    () => clinicToFormValues(clinicQuery.data),
    [clinicQuery.data],
  );

  const handleSubmit = async (payload: ClinicCreatePayload) => {
    try {
      await updateClinic.mutateAsync(payload);
      toast.success("Cadastro da clínica atualizado com sucesso.");
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível atualizar os dados da clínica.");
    }
  };

  if (clinicQuery.isLoading) {
    return (
      <PageLayout title="Clínica">
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
          <Spinner className="mr-2" />
          Carregando dados da clínica...
        </div>
      </PageLayout>
    );
  }

  if (!clinicQuery.data) {
    return (
      <PageLayout title="Clínica">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Clínica não encontrada</CardTitle>
            <CardDescription>
              Não foi possível carregar o cadastro da clínica atual.
            </CardDescription>
          </CardHeader>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Clínica"
      actions={
        <Button asChild variant="outline">
          <Link to={clinicPath("/team")}>
            <UsersIcon />
            Ver equipe
          </Link>
        </Button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-mint-300 text-forest-900">
                <ClinicIcon size={18} />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-base">Cadastro da clínica</CardTitle>
                <CardDescription>
                  Atualize nome, contato, endereço e observações operacionais da
                  clínica.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ClinicForm
              initialValues={initialValues}
              onSubmit={handleSubmit}
              isSubmitting={updateClinic.isPending}
              submitLabel="Salvar alterações"
              submitPendingLabel="Salvando alterações..."
              canEdit={canEdit}
              readOnlyMessage="Seu acesso está vinculado à clínica, mas a edição dos dados institucionais fica restrita ao responsável principal."
              additionalInfoCollapsible={false}
            />
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumo operacional</CardTitle>
              <CardDescription>
                Informações principais usadas pela equipe no dia a dia.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-[13.5px]">
              <dl className="divide-y divide-border">
                <div className="flex items-center justify-between gap-3 pb-3">
                  <dt className="text-muted-foreground">Perfil</dt>
                  <dd>
                    <Badge variant={canEdit ? "default" : "secondary"}>
                      {canEdit ? "Responsável" : "Veterinário"}
                    </Badge>
                  </dd>
                </div>
                <div className="py-3">
                  <dt className="text-xs text-muted-foreground">
                    E-mail de contato
                  </dt>
                  <dd className="mt-0.5 break-all font-semibold text-foreground">
                    {clinicQuery.data.contact_email ?? "Não informado"}
                  </dd>
                </div>
                <div className="py-3">
                  <dt className="text-xs text-muted-foreground">Telefone</dt>
                  <dd className="mt-0.5 font-semibold text-foreground tabular-nums">
                    {clinicQuery.data.contact_phone ?? "Não informado"}
                  </dd>
                </div>
                <div className="pt-3">
                  <dt className="text-xs text-muted-foreground">
                    Cidade / Estado
                  </dt>
                  <dd className="mt-0.5 font-semibold text-foreground">
                    {clinicQuery.data.city || clinicQuery.data.state
                      ? [clinicQuery.data.city, clinicQuery.data.state]
                          .filter(Boolean)
                          .join(" / ")
                      : "Não informado"}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Permissões da clínica</CardTitle>
              <CardDescription>
                Convites e gestão de acesso continuam separados do cadastro
                institucional.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary" className="w-full">
                <Link to={clinicPath("/team")}>
                  <UsersIcon />
                  Gerenciar equipe
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
