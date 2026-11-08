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
      const { first_name, last_name, email } = row.original;
      const initials =
        `${first_name?.[0] ?? ""}${last_name?.[0] ?? ""}`.toUpperCase();
      return (
        <div className="flex items-center gap-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-mint-300 text-xs font-semibold text-forest-900">
            {initials || "—"}
          </span>
          <div className="flex min-w-0 flex-col">
            <span className="font-semibold text-foreground">
              {first_name} {last_name}
            </span>
            <span className="text-[12.5px] text-muted-foreground">
              {email || "—"}
            </span>
          </div>
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
            <span className="text-stone-500">—</span>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cadastrado em" />
    ),
    cell: ({ row }) => {
      return (
        <span className="tabular-nums text-muted-foreground">
          {new Date(row.getValue("created_at")).toLocaleDateString("pt-BR")}
        </span>
      );
    },
  },
];
