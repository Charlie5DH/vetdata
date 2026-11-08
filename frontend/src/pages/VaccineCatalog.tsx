import * as React from "react";
import { toast } from "sonner";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { AlertIcon, PlusIcon } from "@/components/icons/vetdata-icons";

import {
  useCreateCatalogVaccine,
  useDeleteCatalogVaccine,
  useUpdateCatalogVaccine,
  useVaccineCatalog,
} from "@/api/vaccines";
import { PageLayout } from "@/components/layout/page-layout";
import { DataTableToolbar } from "@/components/table/data-table-toolbar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VaccineForm } from "@/components/vaccines/vaccine-form";
import type { Vaccine } from "@/types";
import { getColumns } from "./vaccine-catalog/columns";

export default function VaccineCatalog() {
  const { data: catalog, isLoading, error } = useVaccineCatalog();
  const createVaccine = useCreateCatalogVaccine();
  const updateVaccine = useUpdateCatalogVaccine();
  const deleteVaccine = useDeleteCatalogVaccine();

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Vaccine | null>(null);
  const [deleting, setDeleting] = React.useState<Vaccine | null>(null);

  const columns = React.useMemo(
    () =>
      getColumns({
        onEdit: setEditing,
        onDelete: setDeleting,
      }),
    [],
  );

  const table = useReactTable({
    data: catalog ?? [],
    columns,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return (
      <PageLayout title="Catálogo de vacinas">
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Spinner className="size-6" />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Catálogo de vacinas">
        <div className="rounded-lg border border-border bg-destructive-soft px-4 py-3 text-sm text-destructive">
          Erro ao carregar catálogo de vacinas.
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Catálogo de vacinas"
      actions={
        <Button variant="cta" onClick={() => setCreateOpen(true)}>
          <PlusIcon />
          Nova vacina
        </Button>
      }
    >
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <DataTableToolbar
          table={table}
          searchColumn="name"
          searchPlaceholder="Buscar vacinas..."
        />

        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  Nenhuma vacina encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova vacina</DialogTitle>
            <DialogDescription>
              Adicione uma vacina ao catálogo desta clínica.
            </DialogDescription>
          </DialogHeader>
          <VaccineForm
            isSubmitting={createVaccine.isPending}
            submitLabel="Adicionar vacina"
            onCancel={() => setCreateOpen(false)}
            onSubmit={async (payload) => {
              try {
                await createVaccine.mutateAsync(payload);
                toast.success("Vacina adicionada ao catálogo.");
                setCreateOpen(false);
              } catch (err) {
                console.error(err);
                toast.error("Não foi possível adicionar a vacina.");
              }
            }}
          />
        </DialogContent>
      </Dialog>

      <Sheet
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Editar vacina</SheetTitle>
            <SheetDescription>
              Atualize os parâmetros da vacina selecionada.
            </SheetDescription>
          </SheetHeader>
          {editing ? (
            <div className="p-6 pt-0">
              <VaccineForm
                initialVaccine={editing}
                isSubmitting={updateVaccine.isPending}
                submitLabel="Salvar alterações"
                onCancel={() => setEditing(null)}
                onSubmit={async (payload) => {
                  try {
                    await updateVaccine.mutateAsync({
                      id: editing.id,
                      ...payload,
                    });
                    toast.success("Vacina atualizada.");
                    setEditing(null);
                  } catch (err) {
                    console.error(err);
                    toast.error("Erro ao atualizar a vacina.");
                  }
                }}
              />
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <AlertIcon />
            </AlertDialogMedia>
            <AlertDialogTitle>Excluir vacina</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting
                ? `Deseja realmente excluir ${deleting.name}? A exclusão só será concluída se a vacina não estiver vinculada a registros.`
                : "Deseja realmente excluir esta vacina?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteVaccine.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteVaccine.isPending || !deleting}
              onClick={async () => {
                if (!deleting) return;
                try {
                  await deleteVaccine.mutateAsync(deleting.id);
                  toast.success("Vacina excluída.");
                  setDeleting(null);
                } catch (err) {
                  console.error(err);
                  toast.error("Não foi possível excluir a vacina.");
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
