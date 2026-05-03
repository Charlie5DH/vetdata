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
import type { Vaccine } from "@/types";

interface VaccineColumnsOptions {
  onEdit: (vaccine: Vaccine) => void;
  onDelete: (vaccine: Vaccine) => void;
}

const SPECIES_LABEL: Record<string, string> = {
  dog: "Cães",
  cat: "Gatos",
  all: "Todas",
};

export function getColumns({
  onEdit,
  onDelete,
}: VaccineColumnsOptions): ColumnDef<Vaccine>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nome" />
      ),
      cell: ({ row }) => {
        const vaccine = row.original;
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{vaccine.name}</span>
            {vaccine.is_seed ? (
              <Badge variant="secondary" className="text-[10px]">
                Sistema
              </Badge>
            ) : null}
            {vaccine.is_mandatory ? (
              <Badge variant="default" className="text-[10px]">
                Obrigatória
              </Badge>
            ) : null}
          </div>
        );
      },
    },
    {
      accessorKey: "species",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Espécie" />
      ),
      cell: ({ row }) => (
        <Badge variant="outline">
          {SPECIES_LABEL[row.getValue("species") as string] ?? row.getValue("species")}
        </Badge>
      ),
    },
    {
      accessorKey: "diseases",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Doenças cobertas" />
      ),
      cell: ({ row }) => {
        const diseases = row.getValue("diseases") as string[] | null | undefined;
        if (!diseases?.length) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {diseases.slice(0, 3).map((d) => (
              <Badge key={d} variant="secondary" className="text-[10px]">
                {d}
              </Badge>
            ))}
            {diseases.length > 3 ? (
              <Badge variant="outline" className="text-[10px]">
                +{diseases.length - 3}
              </Badge>
            ) : null}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "doses_in_series",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Doses" />
      ),
      cell: ({ row }) => <div>{row.getValue("doses_in_series") ?? "—"}</div>,
    },
    {
      accessorKey: "booster_interval_days",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Reforço (dias)" />
      ),
      cell: ({ row }) => <div>{row.getValue("booster_interval_days") ?? "—"}</div>,
    },
    {
      id: "actions",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const vaccine = row.original;
        if (vaccine.is_seed) {
          return (
            <span className="text-xs text-muted-foreground">Somente leitura</span>
          );
        }
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="ml-auto">
                <IconDotsVertical className="h-4 w-4" />
                <span className="sr-only">Ações</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onEdit(vaccine)}>
                <IconEdit className="h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(vaccine)}
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
