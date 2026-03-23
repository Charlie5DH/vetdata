import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Building2, Loader2, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";

import { useCurrentUser } from "@/api/auth";
import { useMyClinic, useUpdateMyClinic } from "@/api/clinics";
import { PageLayout } from "@/components/layout/page-layout";
import { Badge } from "@/components/ui/badge";
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
          <Loader2 className="mr-2 size-4 animate-spin" />
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
            <CardTitle>Clínica não encontrada</CardTitle>
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
            <Users className="mr-2 size-4" />
            Ver equipe
          </Link>
        </Button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Building2 className="size-5" />
              </div>
              <div className="space-y-1">
                <CardTitle>Cadastro da clínica</CardTitle>
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
              <CardTitle>Resumo operacional</CardTitle>
              <CardDescription>
                Informações principais usadas pela equipe no dia a dia.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 px-4 py-3">
                <span className="text-muted-foreground">Perfil</span>
                <Badge variant={canEdit ? "secondary" : "outline"}>
                  {canEdit ? "Responsável" : "Veterinário"}
                </Badge>
              </div>
              <div className="rounded-2xl border border-border/70 px-4 py-3">
                <p className="text-muted-foreground">E-mail de contato</p>
                <p className="mt-1 font-medium">
                  {clinicQuery.data.contact_email ?? "Não informado"}
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 px-4 py-3">
                <p className="text-muted-foreground">Telefone</p>
                <p className="mt-1 font-medium">
                  {clinicQuery.data.contact_phone ?? "Não informado"}
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 px-4 py-3">
                <p className="text-muted-foreground">Cidade / Estado</p>
                <p className="mt-1 font-medium">
                  {clinicQuery.data.city || clinicQuery.data.state
                    ? [clinicQuery.data.city, clinicQuery.data.state]
                        .filter(Boolean)
                        .join(" / ")
                    : "Não informado"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <CardTitle>Permissões da clínica</CardTitle>
                  <CardDescription>
                    Convites e gestão de acesso continuam separados do cadastro
                    institucional.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to={clinicPath("/team")}>
                  <Users className="mr-2 size-4" />
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
