import { type Column } from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevDIcon, ChevUdIcon } from "@/components/icons/vetdata-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="xs"
            className="-ml-2.5 h-7 px-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground data-[state=open]:bg-accent data-[state=open]:text-foreground [&_svg]:text-stone-500"
          >
            <span>{title}</span>
            {column.getIsSorted() === "desc" ? (
              <ChevDIcon className="size-3.5" />
            ) : column.getIsSorted() === "asc" ? (
              <ChevDIcon className="size-3.5 rotate-180" />
            ) : (
              <ChevUdIcon className="size-3.5" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ChevDIcon className="size-3.5 rotate-180 text-stone-500" />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ChevDIcon className="size-3.5 text-stone-500" />
            Desc
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => column.clearSorting()}>
            <ChevUdIcon className="size-3.5 text-stone-500" />
            Original
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
