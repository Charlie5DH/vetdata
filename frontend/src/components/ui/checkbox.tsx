import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { CheckIcon } from "@/components/icons/vetdata-icons"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-cream-500 bg-white outline-none transition-[background-color,border-color,box-shadow] duration-150 ease-out after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-forest-600 focus-visible:ring-[3px] focus-visible:ring-forest-900/12 data-checked:border-primary data-checked:bg-primary data-checked:text-lemon-300 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/12 aria-invalid:aria-checked:border-primary disabled:cursor-not-allowed disabled:border-input disabled:bg-cream-300 disabled:text-stone-400",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <CheckIcon size={12} strokeWidth={3} className="size-3" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
