import type { ColumnDef } from "@tanstack/react-table";
import {
  EditIcon,
  MoreIcon,
  TrashIcon,
  VialIcon,
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
          <div className="flex items-center gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-foreground">
              <VialIcon size={16} />
            </span>
            <span className="font-semibold text-foreground">
              {vaccine.name}
            </span>
            {vaccine.is_seed ? <Badge variant="secondary">Sistema</Badge> : null}
            {vaccine.is_mandatory ? (
              <Badge variant="info">Obrigatória</Badge>
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
        if (!diseases?.length)
          return <span className="text-stone-500">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {diseases.slice(0, 3).map((d) => (
              <Badge key={d} variant="secondary">
                {d}
              </Badge>
            ))}
            {diseases.length > 3 ? (
              <Badge variant="outline" className="tabular-nums">
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
        <DataTableColumnHeader
          column={column}
          title="Doses"
          className="justify-end"
        />
      ),
      cell: ({ row }) => {
        const doses = row.getValue("doses_in_series") as number | null;
        return (
          <div className="text-right tabular-nums">
            {doses ?? <span className="text-stone-500">—</span>}
          </div>
        );
      },
    },
    {
      accessorKey: "booster_interval_days",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Reforço"
          className="justify-end"
        />
      ),
      cell: ({ row }) => {
        const days = row.getValue("booster_interval_days") as number | null;
        return (
          <div className="text-right tabular-nums">
            {days != null ? (
              <>
                {days}
                <span className="ml-[3px] text-muted-foreground">dias</span>
              </>
            ) : (
              <span className="text-stone-500">—</span>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Ações</span>,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const vaccine = row.original;
        if (vaccine.is_seed) {
          return (
            <span className="float-right text-xs text-muted-foreground">
              Somente leitura
            </span>
          );
        }
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="float-right">
                <MoreIcon />
                <span className="sr-only">Ações</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onEdit(vaccine)}>
                <EditIcon />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(vaccine)}
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
