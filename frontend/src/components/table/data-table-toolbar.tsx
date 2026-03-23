import * as React from "react";
import { IconChevronDown, IconFilter, IconSearch } from "@tabler/icons-react";
import type { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="relative">
          <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(event) =>
              table.getColumn(searchColumn)?.setFilterValue(event.target.value)
            }
            className="pl-8 w-[250px]"
          />
        </div>
        {leftExtra}
      </div>
      <div className="flex items-center gap-2">
        {filterOptions && filterOptions.options.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconFilter className="mr-2 h-4 w-4" />
                <span className="hidden lg:inline">{filterOptions.label}</span>
                <IconChevronDown className="ml-2 h-4 w-4" />
              </Button>
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
