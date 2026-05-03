import type { ColumnDef } from "@tanstack/react-table";
import { IconDotsVertical, IconEdit, IconTrash } from "@tabler/icons-react";

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
        <div className="font-medium">
          {row.original.patient?.name ?? "—"}
        </div>
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
          <div className="flex flex-col">
            <span className="text-sm font-medium">{vaccine?.name ?? "—"}</span>
            {vaccine?.species ? (
              <span className="text-[10px] uppercase text-muted-foreground">
                {vaccine.species === "cat"
                  ? "Felina"
                  : vaccine.species === "dog"
                  ? "Canina"
                  : vaccine.species}
              </span>
            ) : null}
          </div>
        );
      },
    },
    {
      accessorKey: "dose_number",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Dose" />
      ),
      cell: ({ row }) => row.getValue("dose_number") ?? "—",
    },
    {
      accessorKey: "applied_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Aplicada em" />
      ),
      cell: ({ row }) => (
        <div className="text-xs">
          {formatDate(row.getValue("applied_at"))}
        </div>
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
        if (!next) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs">{formatDate(next)}</span>
            {overdue ? (
              <Badge variant="destructive" className="w-fit text-[10px]">
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
      cell: ({ row }) => row.getValue("batch") || "—",
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={status === "applied" ? "default" : "secondary"}>
            {STATUS_LABEL[status] ?? status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="ml-auto">
              <IconDotsVertical className="h-4 w-4" />
              <span className="sr-only">Ações</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              <IconEdit className="h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(row.original)}
            >
              <IconTrash className="h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
