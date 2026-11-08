import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Tabs as TabsPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "gap-2 group/tabs flex data-[orientation=horizontal]:flex-col",
        className,
      )}
      {...props}
    />
  );
}

const tabsListVariants = cva(
  "group/tabs-list text-muted-foreground inline-flex w-fit items-center group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col group-data-[orientation=vertical]/tabs:items-stretch",
  {
    variants: {
      variant: {
        // Segmented pill (Day/Week/Month)
        default:
          "bg-muted border-border h-auto gap-0.5 rounded-full border p-[3px] group-data-[orientation=vertical]/tabs:rounded-2xl",
        // Underline tabs on a hairline baseline (patient page)
        line: "border-border h-auto gap-6 rounded-none border-b bg-transparent p-0 group-data-[orientation=vertical]/tabs:gap-0 group-data-[orientation=vertical]/tabs:border-r group-data-[orientation=vertical]/tabs:border-b-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "text-muted-foreground hover:text-foreground focus-visible:ring-ring/40 data-active:text-foreground relative inline-flex flex-1 items-center justify-center gap-[7px] whitespace-nowrap transition-[color,background-color,border-color,box-shadow] duration-150 ease-out outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:text-stone-400 group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start [&_svg]:pointer-events-none [&_svg]:shrink-0",
        // default: segmented pill, white active segment
        "group-data-[variant=default]/tabs-list:rounded-full group-data-[variant=default]/tabs-list:px-3.5 group-data-[variant=default]/tabs-list:py-1.5 group-data-[variant=default]/tabs-list:text-[13px] group-data-[variant=default]/tabs-list:font-medium group-data-[variant=default]/tabs-list:data-active:bg-white group-data-[variant=default]/tabs-list:data-active:font-semibold group-data-[variant=default]/tabs-list:data-active:shadow-sm group-data-[variant=default]/tabs-list:[&_svg:not([class*='size-'])]:size-4",
        // line: 2px forest underline on the list's hairline
        "group-data-[variant=line]/tabs-list:flex-none group-data-[variant=line]/tabs-list:rounded-none group-data-[variant=line]/tabs-list:border-transparent group-data-[variant=line]/tabs-list:py-2.5 group-data-[variant=line]/tabs-list:text-sm group-data-[variant=line]/tabs-list:font-normal group-data-[variant=line]/tabs-list:data-active:border-primary group-data-[variant=line]/tabs-list:data-active:font-semibold group-data-[variant=line]/tabs-list:[&_svg:not([class*='size-'])]:size-3.5",
        "group-data-[orientation=horizontal]/tabs:group-data-[variant=line]/tabs-list:-mb-px group-data-[orientation=horizontal]/tabs:group-data-[variant=line]/tabs-list:border-b-2 group-data-[orientation=vertical]/tabs:group-data-[variant=line]/tabs-list:-mr-px group-data-[orientation=vertical]/tabs:group-data-[variant=line]/tabs-list:border-r-2 group-data-[orientation=vertical]/tabs:group-data-[variant=line]/tabs-list:px-3",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("text-sm flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
