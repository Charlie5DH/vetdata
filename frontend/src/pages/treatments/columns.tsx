import { Link } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/table/column-header";
import { Badge } from "@/components/ui/badge";
import type { TreatmentSession } from "@/types";

export const columns: ColumnDef<TreatmentSession>[] = [
  {
    accessorFn: (row) => row.patient?.name || "Unknown",
    id: "patient",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Paciente" />
    ),
    cell: ({ row }) => {
      return (
        <div className="font-medium">
          {row.original.patient?.name || "Paciente Desconhecido"}
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
          className="text-sm font-medium hover:underline"
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
        <Badge
          variant={status === "active" ? "default" : "secondary"}
          className="capitalize"
        >
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
        <div className="text-xs">
          {new Date(row.getValue("started_at")).toLocaleString()}
        </div>
      );
    },
  },
  {
    accessorKey: "logs",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Registros" />
    ),
    cell: ({ row }) => {
      const logs = row.original.logs || [];
      return (
        <div className="flex flex-col gap-0.5">
          <div className="text-xs font-medium">{logs.length} registros</div>
          {logs.length > 0 && (
            <div className="text-[10px] text-muted-foreground">
              Último:{" "}
              {new Date(logs[logs.length - 1].logged_at).toLocaleTimeString()}
            </div>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
];
