import * as React from "react";
import type { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { ChevDIcon, FilterIcon, SearchIcon } from "@/components/icons/vetdata-icons";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FilterOptions {
  label: string;
  columnId: string;
  options: string[];
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchColumn?: string;
  searchPlaceholder?: string;
  filterOptions?: FilterOptions;
  leftExtra?: React.ReactNode;
  rightExtra?: React.ReactNode;
}

export function DataTableToolbar<TData>({
  table,
  searchColumn = "patient",
  searchPlaceholder = "Search...",
  filterOptions,
  leftExtra,
  rightExtra,
}: DataTableToolbarProps<TData>) {
  const searchValue =
    (table.getColumn(searchColumn)?.getFilterValue() as string) ?? "";

  const filterValue = filterOptions
    ? table.getColumn(filterOptions.columnId)?.getFilterValue()
    : undefined;

  return (
    <div
      data-slot="data-table-toolbar"
      className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3"
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-[240px]">
          <SearchIcon
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone-500"
          />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(event) =>
              table.getColumn(searchColumn)?.setFilterValue(event.target.value)
            }
            className="h-[34px] w-full max-w-full pl-9 pr-3.5 text-[13.5px]"
          />
        </div>
        {leftExtra}
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:ml-auto sm:justify-end">
        {filterOptions && filterOptions.options.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                data-active={filterValue !== undefined}
                className={cn(
                  "inline-flex h-7 items-center gap-1.5 rounded-sm border border-input bg-card px-2.5 text-[12.5px] font-medium text-foreground outline-none transition-colors duration-150 ease-out hover:bg-muted focus-visible:border-forest-600 focus-visible:ring-[3px] focus-visible:ring-forest-900/10 data-[state=open]:bg-muted [&_svg]:size-[13px] [&_svg]:shrink-0 [&_svg]:text-stone-600",
                  "data-[active=true]:border-primary data-[active=true]:bg-lemon-100 data-[active=true]:[&_svg]:text-foreground",
                )}
              >
                <FilterIcon size={13} />
                <span className="hidden lg:inline">{filterOptions.label}</span>
                <ChevDIcon size={13} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuCheckboxItem
                checked={
                  table.getColumn(filterOptions.columnId)?.getFilterValue() ===
                  undefined
                }
                onCheckedChange={() =>
                  table
                    .getColumn(filterOptions.columnId)
                    ?.setFilterValue(undefined)
                }
              >
                All {filterOptions.label}
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              {filterOptions.options.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option}
                  className="capitalize"
                  checked={
                    table
                      .getColumn(filterOptions.columnId)
                      ?.getFilterValue() === option
                  }
                  onCheckedChange={(value) =>
                    table
                      .getColumn(filterOptions.columnId)
                      ?.setFilterValue(value ? option : undefined)
                  }
                >
                  {option}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {rightExtra}
      </div>
    </div>
  );
}
