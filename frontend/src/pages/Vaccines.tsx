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

import { useDeleteVaccination, useVaccinations } from "@/api/vaccines";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VaccineRecordDialog } from "@/components/vaccines/vaccine-record-dialog";
import type { PatientVaccination } from "@/types";
import { getColumns } from "./vaccines/columns";

export default function Vaccines() {
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [overdueOnly, setOverdueOnly] = React.useState(false);
  const filters = React.useMemo(
    () => ({
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
      overdue_only: overdueOnly,
    }),
    [statusFilter, overdueOnly],
  );

  const { data: vaccinations, isLoading, error } = useVaccinations(filters);
  const deleteVaccination = useDeleteVaccination();

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<PatientVaccination | null>(null);
  const [deleting, setDeleting] = React.useState<PatientVaccination | null>(null);

  const columns = React.useMemo(
    () =>
      getColumns({
        onEdit: setEditing,
        onDelete: setDeleting,
      }),
    [],
  );

  const table = useReactTable({
    data: vaccinations ?? [],
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
      <PageLayout title="Vacinas">
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Spinner className="size-6" />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Vacinas">
        <div className="rounded-lg border border-border bg-destructive-soft px-4 py-3 text-sm text-destructive">
          Erro ao carregar vacinações.
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Vacinas"
      actions={
        <Button variant="cta" onClick={() => setCreateOpen(true)}>
          <PlusIcon />
          Registrar vacina
        </Button>
      }
    >
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <DataTableToolbar
          table={table}
          searchColumn="patient"
          searchPlaceholder="Buscar por paciente..."
          leftExtra={
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger
                size="sm"
                id="status-filter"
                aria-label="Status"
                className="w-44"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="applied">Aplicadas</SelectItem>
                <SelectItem value="scheduled">Agendadas</SelectItem>
                <SelectItem value="skipped">Não aplicadas</SelectItem>
              </SelectContent>
            </Select>
          }
          rightExtra={
            <div className="flex items-center gap-2">
              <Switch
                id="overdue-toggle"
                checked={overdueOnly}
                onCheckedChange={setOverdueOnly}
              />
              <Label htmlFor="overdue-toggle" className="text-[13px]">
                Apenas atrasadas
              </Label>
            </div>
          }
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
                  Nenhuma vacinação registrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <VaccineRecordDialog open={createOpen} onOpenChange={setCreateOpen} />
      <VaccineRecordDialog
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        vaccination={editing}
      />

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
            <AlertDialogTitle>Excluir vacinação</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting
                ? `Deseja realmente excluir o registro da vacina ${deleting.vaccine?.name ?? ""}?`
                : "Deseja realmente excluir este registro?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteVaccination.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteVaccination.isPending || !deleting}
              onClick={async () => {
                if (!deleting) return;
                try {
                  await deleteVaccination.mutateAsync(deleting.id);
                  toast.success("Registro excluído.");
                  setDeleting(null);
                } catch (err) {
                  console.error(err);
                  toast.error("Não foi possível excluir.");
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
