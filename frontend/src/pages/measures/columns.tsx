import type { ColumnDef } from "@tanstack/react-table";

import {
  EditIcon,
  MoreIcon,
  ScaleIcon,
  TrashIcon,
} from "@/components/icons/vetdata-icons";
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

function formatLimit(value: unknown, unit: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  const formatted =
    typeof value === "number" ? value.toLocaleString("pt-BR") : String(value);
  return (
    <>
      <span className="text-foreground">{formatted}</span>
      {unit ? (
        <span className="ml-[3px] text-xs text-muted-foreground">
          {String(unit)}
        </span>
      ) : null}
    </>
  );
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
        <div className="flex items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
            <ScaleIcon size={16} />
          </span>
          <span className="font-semibold text-foreground">
            {row.getValue("name")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "unit",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Unidade" />
      ),
      cell: ({ row }) =>
        row.getValue("unit") ? (
          <span>{row.getValue("unit")}</span>
        ) : (
          <span className="text-stone-500">—</span>
        ),
    },
    {
      accessorKey: "data_type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tipo" />
      ),
      cell: ({ row }) => (
        <Badge variant="secondary" className="capitalize">
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
        if (!options) return <span className="text-stone-500">—</span>;

        return (
          <div className="flex flex-wrap gap-1">
            {Array.isArray(options) ? (
              options.map((opt: string) => (
                <Badge key={opt} variant="outline">
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
        <DataTableColumnHeader
          column={column}
          title="Limite Inferior"
          className="justify-end"
        />
      ),
      cell: ({ row }) => (
        <div className="text-right tabular-nums">
          {formatLimit(row.getValue("lower_limit"), row.original.unit)}
        </div>
      ),
    },
    {
      accessorKey: "upper_limit",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Limite Superior"
          className="justify-end"
        />
      ),
      cell: ({ row }) => (
        <div className="text-right tabular-nums">
          {formatLimit(row.getValue("upper_limit"), row.original.unit)}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Ações</span>,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const measure = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="ml-auto flex text-muted-foreground"
              >
                <MoreIcon />
                <span className="sr-only">Ações da medida</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onEdit(measure)}>
                <EditIcon />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(measure)}
              >
                <TrashIcon />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
