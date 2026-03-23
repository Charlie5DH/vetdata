import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 rounded-md border-[length:var(--app-border-width)] border-transparent bg-clip-padding text-sm font-medium focus-visible:ring-[3px] aria-invalid:ring-[3px] [&_svg:not([class*='size-'])]:size-4 inline-flex cursor-pointer items-center justify-center whitespace-nowrap shadow-xs transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none group/button select-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline:
          "border-border bg-input/30 hover:bg-input/50 hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 aria-expanded:bg-muted aria-expanded:text-foreground",
        destructive:
          "bg-destructive/10 hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/20 text-destructive focus-visible:border-destructive/40 dark:hover:bg-destructive/30",
        link: "bg-transparent text-primary shadow-none underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-[var(--app-control-height)] gap-[var(--app-control-gap)] px-[var(--app-control-px)] has-data-[icon=inline-end]:pr-[calc(var(--app-control-px)-0.25rem)] has-data-[icon=inline-start]:pl-[calc(var(--app-control-px)-0.25rem)]",
        xs: "h-[var(--app-control-height-xs)] gap-[var(--app-control-gap-xs)] px-[var(--app-control-px-xs)] text-xs has-data-[icon=inline-end]:pr-[calc(var(--app-control-px-xs)-0.125rem)] has-data-[icon=inline-start]:pl-[calc(var(--app-control-px-xs)-0.125rem)] [&_svg:not([class*='size-'])]:size-3",
        sm: "h-[var(--app-control-height-sm)] gap-[var(--app-control-gap-sm)] px-[var(--app-control-px-sm)] has-data-[icon=inline-end]:pr-[calc(var(--app-control-px-sm)-0.125rem)] has-data-[icon=inline-start]:pl-[calc(var(--app-control-px-sm)-0.125rem)]",
        lg: "h-[var(--app-control-height-lg)] gap-[calc(var(--app-control-gap)+0.125rem)] px-[calc(var(--app-control-px)+0.25rem)] has-data-[icon=inline-end]:pr-[var(--app-control-px)] has-data-[icon=inline-start]:pl-[var(--app-control-px)]",
        icon: "size-[var(--app-control-icon-size)]",
        "icon-xs":
          "size-[var(--app-control-icon-size-xs)] [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-[var(--app-control-icon-size-sm)]",
        "icon-lg": "size-[var(--app-control-icon-size-lg)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
