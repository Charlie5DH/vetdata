"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Toggle as TogglePrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "group/toggle inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-sm border border-input font-medium text-foreground outline-none transition-[background-color,border-color,box-shadow,color] duration-150 ease-out hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-forest-900/12 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/12 data-[state=on]:border-primary data-[state=on]:bg-lemon-100 disabled:pointer-events-none disabled:border-transparent disabled:bg-cream-300 disabled:text-stone-400 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[13px] [&_svg:not([class*='text-'])]:text-stone-600 data-[state=on]:[&_svg:not([class*='text-'])]:text-primary",
  {
    variants: {
      variant: {
        // Choice chip (DESIGN.md §9 Chips)
        default: "bg-card",
        outline: "bg-transparent",
      },
      size: {
        default: "h-7 min-w-7 px-2.5 text-[12.5px]",
        sm: "h-[26px] min-w-[26px] px-2 text-xs",
        lg: "h-8 min-w-8 px-3 text-[13px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Toggle({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
