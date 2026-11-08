"use client";

import { SearchIcon } from "@/components/icons/vetdata-icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
        <Input
          id="search"
          placeholder={placeholder}
          className="h-[34px] rounded-full pr-3.5 pl-10 text-[13.5px] md:text-[13.5px]"
        />
        <SearchIcon
          size={16}
          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground select-none"
        />
      </div>
    </form>
  );
}
