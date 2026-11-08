import { Link } from "react-router-dom";
import { useSortable } from "@dnd-kit/sortable";
import { GripVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreIcon } from "@/components/icons/vetdata-icons";
import { PetAvatar } from "@/components/patients/pet-avatar";
import {
  formatAgeShort,
  formatWeight,
  ownerFullName,
} from "@/components/patients/patient-format";
import { DataTableColumnHeader } from "@/components/table/column-header";
import type { ColumnDef } from "@tanstack/react-table";
import type { Patient } from "@/types";

// eslint-disable-next-line react-refresh/only-export-components
function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({ id });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon-xs"
      className="cursor-grab text-muted-foreground hover:bg-transparent active:cursor-grabbing"
    >
      <GripVertical className="size-3.5" />
      <span className="sr-only">Arraste para reordenar</span>
    </Button>
  );
}

export const patientColumns: ColumnDef<Patient>[] = [
  {
    id: "drag",
    accessorFn: (row) => row.id,
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    id: "select",
    accessorFn: (row) => row.id,
    header: ({ table }) => (
      <div className="flex w-6 items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Selecionar tudo"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex w-6 items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Selecionar linha"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    id: "patient",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Paciente" />
    ),
    accessorFn: (row) => row.name,
    cell: ({ row }) => (
      <div className="flex min-w-45 items-center gap-3">
        <PetAvatar species={row.original.species} />
        <div className="flex min-w-0 flex-col">
          <Link
            to={`/patients/${row.original.id}`}
            className="font-semibold text-foreground hover:underline"
          >
            {row.original.name}
          </Link>
          <span className="truncate text-[12.5px] text-muted-foreground">
            {[row.original.species, row.original.breed]
              .filter(Boolean)
              .join(" · ") || "—"}
          </span>
        </div>
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "motive",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Motivo" />
    ),
    cell: ({ row }) =>
      row.original.motive ? (
        <span className="block max-w-56 truncate" title={row.original.motive}>
          {row.original.motive}
        </span>
      ) : (
        <span className="text-muted-foreground">Motivo não informado</span>
      ),
  },
  {
    id: "owner",
    accessorFn: (row) => ownerFullName(row.owner) ?? "Desconhecido",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tutor" />
    ),
    cell: ({ row }) => {
      const owner = row.original.owner;
      if (!owner) return <span className="text-muted-foreground">—</span>;
      return (
        <div className="flex flex-col">
          <span className="text-foreground">{ownerFullName(owner)}</span>
          <span className="text-[12.5px] text-muted-foreground tabular-nums">
            {owner.phone || "—"}
          </span>
        </div>
      );
    },
  },
  {
    id: "age",
    accessorFn: (row) => {
      const years = row.age_years || 0;
      const months = row.age_months || 0;
      return years * 12 + months;
    },
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Idade"
        className="justify-end"
      />
    ),
    cell: ({ row }) => (
      <div className="text-right tabular-nums">
        {formatAgeShort(row.original.age_years, row.original.age_months)}
      </div>
    ),
  },
  {
    accessorKey: "weight_kg",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Peso"
        className="justify-end"
      />
    ),
    cell: ({ row }) => {
      const weight = formatWeight(row.original.weight_kg);
      return (
        <div className="text-right tabular-nums">
          {weight ? (
            <>
              {weight}
              <span className="ml-1 text-muted-foreground">kg</span>
            </>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Ações</span>,
    accessorFn: (row) => row.id,
    cell: () => (
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground data-[state=open]:bg-muted"
            >
              <MoreIcon />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem>Editar</DropdownMenuItem>
            <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Excluir</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
    enableSorting: false,
  },
];
