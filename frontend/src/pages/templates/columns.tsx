import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/table/column-header";
import { FileIcon } from "@/components/icons/vetdata-icons";
import type { Template } from "@/types/template";

export const columns: ColumnDef<Template>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nome" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-foreground">
          <FileIcon size={16} />
        </span>
        <span className="font-semibold text-foreground">
          {row.getValue("name")}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descrição" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate text-muted-foreground">
        {row.getValue("description") || "—"}
      </div>
    ),
  },
  {
    accessorKey: "template_measures",
    id: "measures",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Medidas"
        className="text-right"
      />
    ),
    cell: ({ row }) => {
      const count = row.original.template_measures?.length || 0;
      return <div className="text-right tabular-nums">{count} medida(s)</div>;
    },
    enableSorting: false,
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Criado em" />
    ),
    cell: ({ row }) => {
      return (
        <div className="tabular-nums text-muted-foreground">
          {new Date(row.getValue("created_at")).toLocaleDateString("pt-BR")}
        </div>
      );
    },
  },
];
