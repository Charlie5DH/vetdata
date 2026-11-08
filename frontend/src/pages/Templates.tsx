import * as React from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { useTemplates } from "@/api/templates";
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
import { columns } from "./templates/columns";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import {
  ChevLIcon,
  ChevRIcon,
  PlusIcon,
} from "@/components/icons/vetdata-icons";
import { Spinner } from "@/components/ui/spinner";
import { TemplateCreateDialog } from "./templates/template-create-dialog";
import { TemplateDetailsSheet } from "./templates/template-details-sheet";
import type { Template } from "@/types/template";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Templates() {
  const { data: templates, isLoading, error } = useTemplates();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [selectedTemplate, setSelectedTemplate] =
    React.useState<Template | null>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);

  const table = useReactTable({
    data: templates || [],
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

  const handleRowClick = (template: Template) => {
    setSelectedTemplate(template);
    setDetailsOpen(true);
  };

  if (isLoading) {
    return (
      <PageLayout title="Modelos">
        <div className="flex h-full items-center justify-center">
          <Spinner className="size-6 text-muted-foreground" />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Modelos">
        <div className="rounded-xl border border-border bg-card p-5 text-sm text-destructive">
          Erro ao carregar modelos. Recarregue a página para tentar de novo.
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Modelos"
      actions={
        <TemplateCreateDialog>
          <Button variant="cta">
            <PlusIcon />
            Novo modelo
          </Button>
        </TemplateCreateDialog>
      }
    >
      <TemplateDetailsSheet
        template={selectedTemplate}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden rounded-xl border border-border bg-card"
      >
        <DataTableToolbar
          table={table}
          searchColumn="name"
          searchPlaceholder="Buscar modelos..."
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
            <AnimatePresence mode="wait">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, delay: index * 0.02 }}
                    data-state={row.getIsSelected() ? "selected" : undefined}
                    className="group cursor-pointer border-b border-border transition-colors hover:bg-background data-[state=selected]:bg-lemon-100"
                    onClick={() => handleRowClick(row.original)}
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
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    Nenhum modelo encontrado.
                  </TableCell>
                </TableRow>
              )}
            </AnimatePresence>
          </TableBody>
        </Table>

        <div className="flex flex-col gap-3 border-t border-border px-4 py-2.5 text-[12.5px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="hidden flex-1 tabular-nums lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} de{" "}
            {table.getFilteredRowModel().rows.length} linha(s) selecionada(s).
          </div>
          <div className="flex w-full flex-wrap items-center gap-3 sm:gap-4 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label
                htmlFor="rows-per-page"
                className="text-[12.5px] font-normal text-muted-foreground"
              >
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
      </motion.div>
    </PageLayout>
  );
}
