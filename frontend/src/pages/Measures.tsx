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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import {
  AlertIcon,
  ChevLIcon,
  ChevRIcon,
  PlusIcon,
} from "@/components/icons/vetdata-icons";
import { Spinner } from "@/components/ui/spinner";
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
        <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
          <Spinner />
          Carregando medidas...
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Medidas">
        <div className="rounded-lg border border-border bg-destructive-soft px-4 py-3 text-[13.5px] text-destructive">
          Erro ao carregar medidas
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Medidas">
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <DataTableToolbar
          table={table}
          searchColumn="name"
          searchPlaceholder="Buscar medidas..."
          rightExtra={
            <Button asChild variant="cta">
              <Link to={clinicPath("/measures/new")}>
                <PlusIcon />
                Nova medida
              </Link>
            </Button>
          }
        />

        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={
                      header.column.id === "actions" ? "w-14" : undefined
                    }
                  >
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
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={
                        cell.column.id === "actions"
                          ? "w-14 pl-0 text-right"
                          : undefined
                      }
                    >
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
                  Nenhum resultado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex flex-col gap-3 border-t border-border px-4 py-2.5 text-[12.5px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="hidden flex-1 lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} de{" "}
            {table.getFilteredRowModel().rows.length} linha(s) selecionada(s).
          </div>
          <div className="flex w-full flex-wrap items-center gap-3 sm:gap-4 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-[12.5px]">
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
            <div className="flex w-fit items-center justify-center tabular-nums">
              Página {table.getState().pagination.pageIndex + 1} de{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-1 lg:ml-0">
              <Button
                variant="ghost"
                size="icon-sm"
                className="hidden lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Ir para a primeira página</span>
                <ChevronsLeft />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Ir para a página anterior</span>
                <ChevLIcon />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Ir para a próxima página</span>
                <ChevRIcon />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="hidden lg:flex"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Ir para a última página</span>
                <ChevronsRight />
              </Button>
            </div>
          </div>
        </div>
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
            <div className="px-6 pb-6">
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
              <AlertIcon />
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
