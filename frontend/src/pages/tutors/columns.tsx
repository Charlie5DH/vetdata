import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/table/column-header";
import { Badge } from "@/components/ui/badge";
import type { Owner as Tutor } from "@/types";

export const columns: ColumnDef<Tutor>[] = [
  {
    accessorFn: (row) => `${row.first_name} ${row.last_name}`,
    id: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nome" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium">
            {row.original.first_name} {row.original.last_name}
          </span>
          <span className="text-xs text-muted-foreground">
            {row.original.email}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "patients",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pacientes" />
    ),
    cell: ({ row }) => {
      const patients = row.original.patients || [];
      return (
        <div className="flex flex-wrap gap-1">
          {patients.map((patient) => (
            <Badge key={patient.id} variant="secondary">
              {patient.name}
            </Badge>
          ))}
          {patients.length === 0 && (
            <span className="text-muted-foreground text-xs">-</span>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Data de Cadastro" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-xs">
          {new Date(row.getValue("created_at")).toLocaleDateString()}
        </div>
      );
    },
  },
];
