import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full resize-none rounded-xl border border-input bg-transparent px-4 py-3 text-sm text-foreground outline-none transition-[background-color,border-color,box-shadow] duration-150 ease-out placeholder:text-stone-500 hover:border-forest-500 hover:bg-muted focus-visible:border-forest-600 focus-visible:bg-muted focus-visible:ring-[3px] focus-visible:ring-forest-900/10 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/12 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-55",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
