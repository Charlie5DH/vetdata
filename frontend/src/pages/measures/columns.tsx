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
import type { Measure } from "@/types";

interface MeasureColumnsOptions {
  onEdit: (measure: Measure) => void;
  onDelete: (measure: Measure) => void;
}

export function getColumns({
  onEdit,
  onDelete,
}: MeasureColumnsOptions): ColumnDef<Measure>[] {
  return [
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
      accessorKey: "unit",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Unidade" />
      ),
      cell: ({ row }) => <div>{row.getValue("unit") || "-"}</div>,
    },
    {
      accessorKey: "data_type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tipo" />
      ),
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.getValue("data_type")}
        </Badge>
      ),
    },
    {
      accessorKey: "options",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Opções" />
      ),
      cell: ({ row }) => {
        const options = row.getValue("options");
        if (!options) return "-";

        return (
          <div className="flex flex-wrap gap-1">
            {Array.isArray(options) ? (
              options.map((opt: string) => (
                <Badge key={opt} variant="secondary">
                  {opt}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">
                {JSON.stringify(options)}
              </span>
            )}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "lower_limit",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Limite Inferior" />
      ),
      cell: ({ row }) => <div>{row.getValue("lower_limit") ?? "-"}</div>,
    },
    {
      accessorKey: "upper_limit",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Limite Superior" />
      ),
      cell: ({ row }) => <div>{row.getValue("upper_limit") ?? "-"}</div>,
    },
    {
      id: "actions",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const measure = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="ml-auto">
                <IconDotsVertical className="h-4 w-4" />
                <span className="sr-only">Ações da medida</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onEdit(measure)}>
                <IconEdit className="h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(measure)}
              >
                <IconTrash className="h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
