import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva("relative grid w-full gap-y-[3px] rounded-lg border px-4 py-3.5 text-left text-[13.5px] leading-[1.45] has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[16px_1fr] has-[>svg]:gap-x-3 *:[svg]:row-span-2 *:[svg]:mt-0.5 *:[svg:not([class*='size-'])]:size-4 group/alert", {
  variants: {
    variant: {
      default: "bg-card border-border text-foreground *:[svg]:text-foreground",
      destructive: "bg-destructive-soft border-destructive/25 text-foreground *:[svg]:text-destructive",
      success: "bg-success-soft border-success/25 text-foreground *:[svg]:text-success",
      warning: "bg-warning-soft border-warning/25 text-foreground *:[svg]:text-warning",
      info: "bg-info-soft border-info/25 text-foreground *:[svg]:text-info",
      lemon: "bg-lemon-100 border-cta-border text-foreground *:[svg]:text-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "font-semibold text-foreground group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-stone-700 text-[13.5px] text-balance group-has-[>svg]/alert:col-start-2 md:text-pretty [&_p:not(:last-child)]:mb-4 [&_a]:font-semibold [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-3",
        className
      )}
      {...props}
    />
  )
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("absolute top-2.5 right-3", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
