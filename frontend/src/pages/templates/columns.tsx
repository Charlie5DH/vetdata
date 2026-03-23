import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/table/column-header";
import type { Template } from "@/types/template";

export const columns: ColumnDef<Template>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nome" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descrição" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate text-muted-foreground">
        {row.getValue("description") || "-"}
      </div>
    ),
  },
  {
    accessorKey: "template_measures",
    id: "measures",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Medidas" />
    ),
    cell: ({ row }) => {
      const count = row.original.template_measures?.length || 0;
      return <div className="text-sm">{count} medida(s)</div>;
    },
    enableSorting: false,
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Data de Criação" />
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
