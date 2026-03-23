import { Link } from "react-router-dom";
import { useSortable } from "@dnd-kit/sortable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SpeciesBadge } from "@/components/species-badge";
import { DataTableColumnHeader } from "@/components/table/column-header";
import { IconDotsVertical, IconGripVertical } from "@tabler/icons-react";
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
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent cursor-grab active:cursor-grabbing"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
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
      <div className="flex items-center justify-center">
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
      <div className="flex items-center justify-center">
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
      <div className="flex flex-col min-w-45">
        <div className="flex items-center gap-2">
          <Link
            to={`/patients/${row.original.id}`}
            className="font-medium hover:underline"
          >
            {row.original.name}
          </Link>
          <SpeciesBadge species={row.original.species} />
        </div>
        <span
          className="text-sm text-muted-foreground truncate"
          title={row.original.motive || ""}
        >
          {row.original.motive || "Motivo não informado"}
        </span>
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "breed",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Raça" />
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.breed || "-"}</span>
    ),
  },
  {
    id: "owner",
    accessorFn: (row) =>
      row.owner
        ? `${row.owner.first_name} ${row.owner.last_name}`
        : "Desconhecido",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tutor" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">
        {row.original.owner
          ? `${row.original.owner.first_name} ${row.original.owner.last_name}`
          : "-"}
      </div>
    ),
  },
  {
    id: "age",
    accessorFn: (row) => {
      const years = row.age_years || 0;
      const months = row.age_months || 0;
      return years * 12 + months;
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Idade" />
    ),
    cell: ({ row }) => (
      <div className="text-muted-foreground">
        {row.original.age_years ? `${row.original.age_years}a` : ""}{" "}
        {row.original.age_months ? `${row.original.age_months}m` : ""}
      </div>
    ),
  },
  {
    accessorKey: "weight_kg",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Peso" />
    ),
    cell: ({ row }) => (
      <div className="text-muted-foreground">
        {row.original.weight_kg ? `${row.original.weight_kg} kg` : "-"}
      </div>
    ),
  },
  {
    id: "actions",
    accessorFn: (row) => row.id,
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <IconDotsVertical className="size-4" />
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
    ),
    enableSorting: false,
  },
];
