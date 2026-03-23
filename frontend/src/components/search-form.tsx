"use client";

import { Label } from "@/components/ui/label";
import { SidebarInput } from "@/components/ui/sidebar";
import { SearchIcon } from "lucide-react";

interface SearchFormProps extends React.ComponentProps<"form"> {
  placeholder?: string;
}

export function SearchForm({
  placeholder = "Buscar...",
  onSubmit,
  ...props
}: SearchFormProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.(event);
      }}
      {...props}
    >
      <div className="relative">
        <Label htmlFor="search" className="sr-only">
          Buscar
        </Label>
        <SidebarInput
          id="search"
          placeholder={placeholder}
          className="h-12 min-h-12 px-3 pl-9"
        />
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 opacity-50 select-none" />
      </div>
    </form>
  );
}
