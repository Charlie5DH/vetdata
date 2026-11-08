import { Link } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/table/column-header";
import { PetAvatar } from "@/components/patients/pet-avatar";
import { Badge } from "@/components/ui/badge";
import type { TreatmentSession } from "@/types";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const columns: ColumnDef<TreatmentSession>[] = [
  {
    accessorFn: (row) => row.patient?.name || "Unknown",
    id: "patient",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Paciente" />
    ),
    cell: ({ row }) => {
      const patient = row.original.patient;
      return (
        <div className="flex items-center gap-3">
          <PetAvatar species={patient?.species} />
          <div className="flex min-w-0 flex-col">
            <span className="font-semibold text-foreground">
              {patient?.name || "Paciente Desconhecido"}
            </span>
            <span className="truncate text-[12.5px] text-muted-foreground">
              {[patient?.species, patient?.breed].filter(Boolean).join(" · ") ||
                "—"}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorFn: (row) => row.template?.name || "Unknown",
    id: "template",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Modelo" />
    ),
    cell: ({ row }) => {
      return (
        <Link
          to={`/treatments/${row.original.id}`}
          className="font-medium text-foreground hover:underline"
        >
          {row.original.template?.name || "Modelo Desconhecido"}
        </Link>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={status === "active" ? "info" : "secondary"}>
          <span aria-hidden className="size-1.5 rounded-full bg-current" />
          {status === "active"
            ? "Ativo"
            : status === "completed"
              ? "Concluído"
              : status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "started_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Iniciado em" />
    ),
    cell: ({ row }) => {
      return (
        <span className="tabular-nums">
          {formatDateTime(row.getValue("started_at"))}
        </span>
      );
    },
  },
  {
    accessorKey: "logs",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Registros"
        className="text-right"
      />
    ),
    cell: ({ row }) => {
      const logs = row.original.logs || [];
      return (
        <div className="flex flex-col items-end gap-0.5 tabular-nums">
          <span className="text-foreground">{logs.length} registros</span>
          {logs.length > 0 && (
            <span className="text-xs text-muted-foreground">
              Último:{" "}
              {new Date(logs[logs.length - 1].logged_at).toLocaleTimeString(
                "pt-BR",
                { hour: "2-digit", minute: "2-digit" },
              )}
            </span>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
];
