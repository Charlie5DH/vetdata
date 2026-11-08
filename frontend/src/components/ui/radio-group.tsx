"use client"

import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3 w-full", className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "group/radio-group-item peer relative flex aspect-square size-4 shrink-0 items-center justify-center rounded-full border border-cream-500 bg-white outline-none transition-[border-color,box-shadow] duration-150 ease-out after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-forest-600 focus-visible:ring-[3px] focus-visible:ring-forest-900/12 data-checked:border-primary aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/12 disabled:cursor-not-allowed disabled:border-input disabled:bg-cream-300",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="block size-2 rounded-full bg-primary group-aria-invalid/radio-group-item:bg-destructive group-disabled/radio-group-item:bg-stone-400"
      />
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
