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
import { motion, AnimatePresence } from "framer-motion";
import { IconAlertTriangle, IconPlus } from "@tabler/icons-react";

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
        <div className="flex items-center justify-center h-full">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-8 w-8 border-b-2 border-primary"
          />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Vacinas">
        <div className="text-destructive">Erro ao carregar vacinações</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Vacinas">
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-wrap items-center gap-3"
        >
          <DataTableToolbar
            table={table}
            searchColumn="patient"
            searchPlaceholder="Buscar por paciente..."
            rightExtra={
              <Button onClick={() => setCreateOpen(true)}>
                <IconPlus className="mr-2 h-4 w-4" />
                Vacinação
              </Button>
            }
          />
        </motion.div>

        <div className="flex flex-wrap items-center gap-4 rounded-md border bg-card px-4 py-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="status-filter">Status:</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status-filter" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="applied">Aplicadas</SelectItem>
                <SelectItem value="scheduled">Agendadas</SelectItem>
                <SelectItem value="skipped">Não aplicadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="overdue-toggle"
              checked={overdueOnly}
              onCheckedChange={setOverdueOnly}
            />
            <Label htmlFor="overdue-toggle">Apenas atrasadas</Label>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-md border bg-card"
        >
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
              <AnimatePresence mode="wait">
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row, index) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className="group hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      Nenhuma vacinação registrada.
                    </TableCell>
                  </TableRow>
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </motion.div>
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
              <IconAlertTriangle />
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
