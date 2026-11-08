import type { ColumnDef } from "@tanstack/react-table";
import { EditIcon, MoreIcon, TrashIcon, VialIcon } from "@/components/icons/vetdata-icons";

import { DataTableColumnHeader } from "@/components/table/column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PatientVaccination } from "@/types";

interface VaccinationColumnsOptions {
  onEdit: (vaccination: PatientVaccination) => void;
  onDelete: (vaccination: PatientVaccination) => void;
}

const STATUS_LABEL: Record<string, string> = {
  applied: "Aplicada",
  scheduled: "Agendada",
  skipped: "Não aplicada",
};

const STATUS_VARIANT: Record<string, "success" | "warning" | "secondary"> = {
  applied: "success",
  scheduled: "warning",
  skipped: "secondary",
};

const SPECIES_LABEL: Record<string, string> = {
  cat: "Felina",
  dog: "Canina",
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
}

export function getColumns({
  onEdit,
  onDelete,
}: VaccinationColumnsOptions): ColumnDef<PatientVaccination>[] {
  return [
    {
      id: "patient",
      accessorFn: (row) => row.patient?.name ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Paciente" />
      ),
      cell: ({ row }) => (
        <span className="font-semibold text-foreground">
          {row.original.patient?.name ?? "—"}
        </span>
      ),
    },
    {
      id: "vaccine",
      accessorFn: (row) => row.vaccine?.name ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Vacina" />
      ),
      cell: ({ row }) => {
        const vaccine = row.original.vaccine;
        return (
          <div className="flex items-center gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-foreground">
              <VialIcon size={16} />
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="font-semibold text-foreground">
                {vaccine?.name ?? "—"}
              </span>
              {vaccine?.species ? (
                <span className="text-[12.5px] text-muted-foreground">
                  {SPECIES_LABEL[vaccine.species] ?? vaccine.species}
                </span>
              ) : null}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "dose_number",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Dose"
          className="justify-end"
        />
      ),
      cell: ({ row }) => (
        <div className="text-right tabular-nums">
          {(row.getValue("dose_number") as number | null) ?? (
            <span className="text-stone-500">—</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "applied_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Aplicada em" />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums">
          {formatDate(row.getValue("applied_at"))}
        </span>
      ),
    },
    {
      accessorKey: "next_due_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Próximo reforço" />
      ),
      cell: ({ row }) => {
        const next = row.original.next_due_at;
        const overdue = row.original.is_overdue;
        if (!next) return <span className="text-stone-500">—</span>;
        return (
          <div className="flex items-center gap-2">
            <span
              className={
                overdue
                  ? "font-semibold text-destructive tabular-nums"
                  : "tabular-nums"
              }
            >
              {formatDate(next)}
            </span>
            {overdue ? (
              <Badge variant="destructive">
                <span className="size-1.5 rounded-full bg-current" />
                Atrasada
              </Badge>
            ) : null}
          </div>
        );
      },
    },
    {
      accessorKey: "batch",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Lote" />
      ),
      cell: ({ row }) =>
        (row.getValue("batch") as string | null) ? (
          <span className="font-mono text-xs">{row.getValue("batch")}</span>
        ) : (
          <span className="text-stone-500">—</span>
        ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={STATUS_VARIANT[status] ?? "secondary"}>
            <span className="size-1.5 rounded-full bg-current" />
            {STATUS_LABEL[status] ?? status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Ações</span>,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="float-right">
              <MoreIcon />
              <span className="sr-only">Ações</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              <EditIcon />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(row.original)}
            >
              <TrashIcon />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
