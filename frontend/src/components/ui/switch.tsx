import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default";
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "data-checked:bg-primary data-unchecked:bg-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 dark:data-unchecked:bg-input/80 shrink-0 rounded-full border-[length:var(--app-border-width)] border-transparent focus-visible:ring-[3px] aria-invalid:ring-[3px] data-[size=default]:h-(--app-switch-height) data-[size=default]:w-(--app-switch-width) data-[size=sm]:h-(--app-switch-height-sm) data-[size=sm]:w-(--app-switch-width-sm) peer group/switch relative inline-flex items-center transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="bg-background dark:data-unchecked:bg-foreground dark:data-checked:bg-primary-foreground rounded-full group-data-[size=default]/switch:size-(--app-switch-thumb-size) group-data-[size=sm]/switch:size-(--app-switch-thumb-size-sm) group-data-[size=default]/switch:data-checked:translate-x-(--app-switch-translate-x) group-data-[size=sm]/switch:data-checked:translate-x-(--app-switch-translate-x-sm) group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0 pointer-events-none block ring-0 transition-transform"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
