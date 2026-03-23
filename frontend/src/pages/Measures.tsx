import * as React from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { PageLayout } from "@/components/layout/page-layout";
import { useClinicPath } from "@/lib/clinic-routes";
import {
  useDeleteMeasure,
  useMeasures,
  useUpdateMeasure,
} from "@/api/templates";
import { MeasureForm } from "@/components/measures/measure-form";
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
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTableToolbar } from "@/components/table/data-table-toolbar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getColumns } from "./measures/columns";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconAlertTriangle,
  IconPlus,
} from "@tabler/icons-react";
import type { Measure } from "@/types";

export default function Measures() {
  const { data: measures, isLoading, error } = useMeasures();
  const updateMeasure = useUpdateMeasure();
  const deleteMeasure = useDeleteMeasure();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const { clinicPath } = useClinicPath();
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [editingMeasure, setEditingMeasure] = React.useState<Measure | null>(
    null,
  );
  const [deletingMeasure, setDeletingMeasure] = React.useState<Measure | null>(
    null,
  );

  const columns = React.useMemo(
    () =>
      getColumns({
        onEdit: setEditingMeasure,
        onDelete: setDeletingMeasure,
      }),
    [],
  );

  const table = useReactTable({
    data: measures || [],
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
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
      <PageLayout title="Medidas">
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
      <PageLayout title="Medidas">
        <div className="text-destructive">Erro ao carregar medidas</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Medidas">
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DataTableToolbar
            table={table}
            searchColumn="name"
            searchPlaceholder="Buscar medidas..."
            rightExtra={
              <Button asChild>
                <Link to={clinicPath("/measures/new")}>
                  <IconPlus className="mr-2 h-4 w-4" />
                  Medida
                </Link>
              </Button>
            }
          />
        </motion.div>

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
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      Nenhum resultado.
                    </TableCell>
                  </TableRow>
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-between"
        >
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} de{" "}
            {table.getFilteredRowModel().rows.length} linha(s) selecionada(s).
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Linhas por página
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Página {table.getState().pagination.pageIndex + 1} de{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Ir para a primeira página</span>
                <IconChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Ir para a página anterior</span>
                <IconChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Ir para a próxima página</span>
                <IconChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Ir para a última página</span>
                <IconChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      <Sheet
        open={Boolean(editingMeasure)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingMeasure(null);
          }
        }}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Editar medida</SheetTitle>
            <SheetDescription>
              Atualize os parâmetros da medida selecionada.
            </SheetDescription>
          </SheetHeader>
          {editingMeasure ? (
            <div className="p-6 pt-0">
              <MeasureForm
                initialMeasure={editingMeasure}
                submitLabel="Salvar alterações"
                isSubmitting={updateMeasure.isPending}
                onCancel={() => setEditingMeasure(null)}
                onSubmit={async (payload) => {
                  try {
                    await updateMeasure.mutateAsync({
                      id: editingMeasure.id,
                      updates: payload,
                    });
                    toast.success("Medida atualizada com sucesso!");
                    setEditingMeasure(null);
                  } catch (error) {
                    console.error(error);
                    toast.error("Erro ao atualizar medida. Tente novamente.");
                  }
                }}
              />
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={Boolean(deletingMeasure)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingMeasure(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <IconAlertTriangle />
            </AlertDialogMedia>
            <AlertDialogTitle>Excluir medida</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingMeasure
                ? `Deseja realmente excluir ${deletingMeasure.name}? A exclusão só será concluída se a medida não estiver em uso.`
                : "Deseja realmente excluir esta medida?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMeasure.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteMeasure.isPending || !deletingMeasure}
              onClick={async () => {
                if (!deletingMeasure) {
                  return;
                }

                try {
                  await deleteMeasure.mutateAsync(deletingMeasure.id);
                  toast.success("Medida excluída com sucesso!");
                  setDeletingMeasure(null);
                } catch (error) {
                  console.error(error);
                  toast.error("Não foi possível excluir a medida.");
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
