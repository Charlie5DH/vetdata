import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded-full bg-clip-padding font-semibold outline-none transition-[background-color,border-color,box-shadow,color] duration-150 ease-out focus-visible:ring-[3px] focus-visible:ring-forest-900/12 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/12 disabled:pointer-events-none disabled:border-transparent disabled:bg-cream-300 disabled:text-stone-400 disabled:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Forest "brand" button
        default:
          "bg-primary text-primary-foreground hover:bg-forest-800 aria-expanded:bg-forest-800",
        // VetData lemon call-to-action: at most one per view (docs/design-system/DESIGN.md)
        cta: "border border-cta-border bg-cta text-cta-foreground shadow-lemon hover:bg-lemon-200 aria-expanded:bg-lemon-200",
        outline:
          "border border-input bg-white font-medium text-foreground shadow-xs hover:bg-card aria-expanded:bg-card",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-cream-300 aria-expanded:bg-cream-300",
        ghost:
          "text-foreground hover:bg-accent aria-expanded:bg-accent",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "rounded-none text-foreground underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-9 px-4 text-sm has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-[26px] gap-1.5 px-[11px] text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-[30px] gap-1.5 px-[13px] text-[13px] has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-[42px] px-[22px] text-[15px] has-data-[icon=inline-end]:pr-[18px] has-data-[icon=inline-start]:pl-[18px]",
        block: "h-10 w-full px-4 text-sm",
        icon: "size-9",
        "icon-xs": "size-[26px] [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-[30px]",
        "icon-lg": "size-[42px]",
      },
    },
    compoundVariants: [
      // Links sit inline with text: no pill box, no padding
      { variant: "link", class: "h-auto px-0 has-data-[icon=inline-end]:pr-0 has-data-[icon=inline-start]:pl-0" },
    ],
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
