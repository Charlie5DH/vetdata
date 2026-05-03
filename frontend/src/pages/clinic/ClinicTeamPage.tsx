import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  Ban,
  Copy,
  Loader2,
  MailPlus,
  MoreHorizontal,
  Trash2,
  ShieldCheck,
  UserRoundPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { useCurrentUser } from "@/api/auth";
import {
  useCancelClinicInvitation,
  useInviteClinicMember,
  useMyClinic,
  useMyClinicInvitations,
  useMyClinicMembers,
  useRemoveClinicMember,
} from "@/api/clinics";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageLayout } from "@/components/layout/page-layout";
import { DataTableColumnHeader } from "@/components/table/column-header";
import { DataTableToolbar } from "@/components/table/data-table-toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useClinicPath } from "@/lib/clinic-routes";

type TeamRow = {
  id: string;
  name: string;
  email: string;
  roleLabel: string;
  roleValue: string;
  joinedAt: string;
};

type InvitationRow = {
  id: string;
  email: string;
  status: string;
  createdAt: string;
};

type InviteFormState = {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
};

const EMPTY_INVITE: InviteFormState = {
  email: "",
  first_name: "",
  last_name: "",
  password: "",
};

const clinicTeamColumns: ColumnDef<TeamRow>[] = [
  {
    id: "member",
    accessorFn: (row) => `${row.name} ${row.email}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Membro" />
    ),
    cell: ({ row }) => (
      <div className="flex min-w-52 flex-col">
        <span className="font-medium text-foreground">{row.original.name}</span>
        <span className="text-sm text-muted-foreground">
          {row.original.email}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "roleLabel",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Função" />
    ),
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.roleValue === "clinic_owner" ? "secondary" : "outline"
        }
      >
        {row.original.roleLabel}
      </Badge>
    ),
  },
  {
    accessorKey: "joinedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Entrou em" />
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.joinedAt}</span>
    ),
  },
];

export default function ClinicTeamPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentUserQuery = useCurrentUser();
  const clinicQuery = useMyClinic();
  const membersQuery = useMyClinicMembers();
  const invitationsQuery = useMyClinicInvitations();
  const inviteMember = useInviteClinicMember();
  const cancelInvitation = useCancelClinicInvitation();
  const removeMember = useRemoveClinicMember();
  const [inviteForm, setInviteForm] = useState<InviteFormState>(EMPTY_INVITE);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [memberPendingRemoval, setMemberPendingRemoval] =
    useState<TeamRow | null>(null);
  const [invitationPendingCancellation, setInvitationPendingCancellation] =
    useState<InvitationRow | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const { clinicPath } = useClinicPath();

  const canInvite = currentUserQuery.data?.clinic_role === "clinic_owner";

  useEffect(() => {
    if (!canInvite) {
      return;
    }

    if (searchParams.get("invite") !== "1") {
      return;
    }

    setInviteDialogOpen(true);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("invite");
    setSearchParams(nextParams, { replace: true });
  }, [canInvite, searchParams, setSearchParams]);

  const teamRows = useMemo<TeamRow[]>(() => {
    return (membersQuery.data ?? []).map((member) => ({
      id: member.id,
      name: member.user_display_name,
      email: member.user_email,
      roleLabel: member.role === "clinic_owner" ? "Responsável" : "Veterinário",
      roleValue: member.role,
      joinedAt: new Date(member.created_at).toLocaleDateString("pt-BR"),
    }));
  }, [membersQuery.data]);

  const teamTable = useReactTable({
    data: teamRows,
    columns: clinicTeamColumns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const invitationRows = useMemo<InvitationRow[]>(() => {
    return (invitationsQuery.data ?? []).map((invitation) => ({
      id: invitation.id,
      email: invitation.email,
      status: invitation.status,
      createdAt: new Date(invitation.created_at).toLocaleDateString("pt-BR"),
    }));
  }, [invitationsQuery.data]);

  const handleCopyEmail = async (nextEmail: string) => {
    try {
      await navigator.clipboard.writeText(nextEmail);
      toast.success("E-mail copiado.");
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível copiar o e-mail.");
    }
  };

  const handleRemoveMember = async () => {
    if (!memberPendingRemoval) {
      return;
    }

    try {
      await removeMember.mutateAsync(memberPendingRemoval.id);
      toast.success("Membro removido da clínica.");
      setMemberPendingRemoval(null);
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível remover o membro.");
    }
  };

  const handleCancelInvitation = async () => {
    if (!invitationPendingCancellation) {
      return;
    }

    try {
      await cancelInvitation.mutateAsync(invitationPendingCancellation.id);
      toast.success("Convite cancelado com sucesso.");
      setInvitationPendingCancellation(null);
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível cancelar o convite.");
    }
  };

  let invitationsSection: React.ReactNode;
  if (invitationsQuery.isLoading) {
    invitationsSection = (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Carregando convites...
      </div>
    );
  } else if (invitationsQuery.data?.length) {
    invitationsSection = (
      <div className="overflow-hidden rounded-2xl border border-border/70">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>E-mail</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitationRows.map((invitation) => (
              <TableRow key={invitation.id}>
                <TableCell className="font-medium">
                  {invitation.email}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="gap-2">
                    <ShieldCheck className="size-3.5" />
                    {invitation.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {invitation.createdAt}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground"
                      >
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Ações do convite</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem
                        onClick={() => void handleCopyEmail(invitation.email)}
                      >
                        <Copy className="mr-2 size-4" />
                        Copiar e-mail
                      </DropdownMenuItem>
                      {canInvite ? (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              setInvitationPendingCancellation(invitation)
                            }
                            disabled={cancelInvitation.isPending}
                            className="text-destructive focus:text-destructive"
                          >
                            <Ban className="mr-2 size-4" />
                            Cancelar convite
                          </DropdownMenuItem>
                        </>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  } else {
    invitationsSection = (
      <p className="text-sm text-muted-foreground">
        Nenhum convite registrado ainda.
      </p>
    );
  }

  const inviteValid =
    inviteForm.email.trim().length > 0 &&
    inviteForm.password.trim().length >= 8;

  const handleInvite = async (event: React.FormEvent) => {
    event.preventDefault();

    const normalizedEmail = inviteForm.email.trim().toLowerCase();
    if (!normalizedEmail) {
      toast.error("Informe o e-mail do membro.");
      return;
    }
    if (inviteForm.password.length < 8) {
      toast.error("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }

    try {
      await inviteMember.mutateAsync({
        email: normalizedEmail,
        password: inviteForm.password,
        first_name: inviteForm.first_name.trim() || undefined,
        last_name: inviteForm.last_name.trim() || undefined,
      });
      setInviteForm(EMPTY_INVITE);
      setInviteDialogOpen(false);
      toast.success(
        clinicQuery.data
          ? `${normalizedEmail} adicionado à clínica ${clinicQuery.data.name}. Compartilhe a senha definida com a pessoa.`
          : `${normalizedEmail} adicionado à clínica. Compartilhe a senha definida com a pessoa.`,
      );
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível criar o convite.");
    }
  };

  return (
    <PageLayout
      title="Equipe da clínica"
      actions={
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link to={clinicPath("/clinic")}>Ver cadastro da clínica</Link>
          </Button>
          {canInvite && (
            <Dialog
              open={inviteDialogOpen}
              onOpenChange={(open) => {
                setInviteDialogOpen(open);
                if (!open) setInviteForm(EMPTY_INVITE);
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <UserRoundPlus className="mr-2 size-4" />
                  Convidar membro
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Adicionar membro da equipe</DialogTitle>
                  <DialogDescription>
                    Defina o email e a senha inicial. A pessoa fará login
                    diretamente com esses dados — compartilhe a senha por um
                    canal seguro.
                  </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleInvite}>
                  <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
                    {clinicQuery.data
                      ? `O acesso será vinculado à clínica ${clinicQuery.data.name}.`
                      : "O acesso será vinculado à clínica atual."}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="invite-first-name">Nome</Label>
                      <Input
                        id="invite-first-name"
                        value={inviteForm.first_name}
                        onChange={(event) =>
                          setInviteForm((prev) => ({
                            ...prev,
                            first_name: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invite-last-name">Sobrenome</Label>
                      <Input
                        id="invite-last-name"
                        value={inviteForm.last_name}
                        onChange={(event) =>
                          setInviteForm((prev) => ({
                            ...prev,
                            last_name: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="invite-email">E-mail</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      value={inviteForm.email}
                      onChange={(event) =>
                        setInviteForm((prev) => ({
                          ...prev,
                          email: event.target.value,
                        }))
                      }
                      placeholder="vet@clinica.com"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="invite-password">Senha inicial</Label>
                    <Input
                      id="invite-password"
                      type="text"
                      value={inviteForm.password}
                      onChange={(event) =>
                        setInviteForm((prev) => ({
                          ...prev,
                          password: event.target.value,
                        }))
                      }
                      placeholder="Mínimo 8 caracteres"
                    />
                    <p className="text-xs text-muted-foreground">
                      Compartilhe esta senha com a pessoa convidada — ela poderá
                      trocá-la depois pelo perfil.
                    </p>
                  </div>

                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={inviteMember.isPending || !inviteValid}
                    >
                      {inviteMember.isPending ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          Adicionando...
                        </>
                      ) : (
                        <>
                          <MailPlus className="mr-2 size-4" />
                          Adicionar membro
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      }
    >
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users className="size-5" />
              </div>
              <div>
                <CardTitle>Membros da equipe</CardTitle>
                <CardDescription>
                  Visualize todos os profissionais vinculados à clínica e
                  acompanhe os acessos ativos.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
              {clinicQuery.data
                ? `Equipe vinculada à clínica ${clinicQuery.data.name}.`
                : "Equipe vinculada à clínica atual."}
            </div>

            {membersQuery.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Carregando equipe...
              </div>
            ) : (
              <div className="space-y-4">
                <DataTableToolbar
                  table={teamTable}
                  searchColumn="member"
                  searchPlaceholder="Buscar por nome ou e-mail..."
                />

                <div className="overflow-hidden rounded-2xl border border-border/70">
                  <Table>
                    <TableHeader>
                      {teamTable.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id} colSpan={header.colSpan}>
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext(),
                                  )}
                            </TableHead>
                          ))}
                          <TableHead className="w-12" />
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {teamTable.getRowModel().rows.length ? (
                        teamTable.getRowModel().rows.map((row) => (
                          <TableRow key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id}>
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext(),
                                )}
                              </TableCell>
                            ))}
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 text-muted-foreground"
                                  >
                                    <MoreHorizontal className="size-4" />
                                    <span className="sr-only">
                                      Ações do membro
                                    </span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-48"
                                >
                                  <DropdownMenuItem
                                    onClick={() =>
                                      void handleCopyEmail(row.original.email)
                                    }
                                  >
                                    <Copy className="mr-2 size-4" />
                                    Copiar e-mail
                                  </DropdownMenuItem>
                                  {canInvite &&
                                  row.original.roleValue !== "clinic_owner" ? (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() =>
                                          setMemberPendingRemoval(row.original)
                                        }
                                        className="text-destructive focus:text-destructive"
                                      >
                                        <Trash2 className="mr-2 size-4" />
                                        Remover membro
                                      </DropdownMenuItem>
                                    </>
                                  ) : null}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={clinicTeamColumns.length + 1}
                            className="h-24 text-center text-muted-foreground"
                          >
                            Nenhum membro encontrado.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de convites</CardTitle>
            <CardDescription>
              Lista dos convites criados para esta clínica.
            </CardDescription>
          </CardHeader>
          <CardContent>{invitationsSection}</CardContent>
        </Card>
      </div>

      <AlertDialog
        open={memberPendingRemoval !== null}
        onOpenChange={(open) => {
          if (!open) {
            setMemberPendingRemoval(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover membro da clínica?</AlertDialogTitle>
            <AlertDialogDescription>
              {memberPendingRemoval
                ? `${memberPendingRemoval.name} perderá o vínculo com esta clínica e deixará de acessar os dados compartilhados.`
                : "O membro selecionado perderá o vínculo com esta clínica."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => void handleRemoveMember()}
            >
              Remover membro
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={invitationPendingCancellation !== null}
        onOpenChange={(open) => {
          if (!open) {
            setInvitationPendingCancellation(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar convite?</AlertDialogTitle>
            <AlertDialogDescription>
              {invitationPendingCancellation
                ? `O registro de convite para ${invitationPendingCancellation.email} será marcado como cancelado.`
                : "O convite selecionado será cancelado."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => void handleCancelInvitation()}
            >
              Cancelar convite
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
