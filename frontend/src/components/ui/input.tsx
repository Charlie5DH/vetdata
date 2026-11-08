import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-full border border-input bg-transparent px-5 text-[15px] text-foreground outline-none transition-[background-color,border-color,box-shadow] duration-150 ease-out placeholder:text-stone-500 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground hover:border-forest-500 hover:bg-muted focus-visible:border-forest-600 focus-visible:bg-muted focus-visible:ring-[3px] focus-visible:ring-forest-900/10 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/12 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-55",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
