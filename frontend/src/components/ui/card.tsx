import * as React from "react";

import { cn } from "@/lib/utils";

function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "ring-foreground/10 bg-card text-card-foreground gap-[var(--app-card-gap)] overflow-hidden rounded-md py-[var(--app-card-padding)] text-sm shadow-xs ring-[length:var(--app-border-width)] has-[>img:first-child]:pt-0 data-[size=sm]:gap-[calc(var(--app-card-gap)-0.25rem)] data-[size=sm]:py-[var(--app-card-padding-sm)] *:[img:first-child]:rounded-t-md *:[img:last-child]:rounded-b-md group/card flex flex-col",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "gap-2 rounded-t-md px-[var(--app-card-padding)] group-data-[size=sm]/card:px-[var(--app-card-padding-sm)] [.border-b]:pb-[var(--app-card-padding)] group-data-[size=sm]/card:[.border-b]:pb-[var(--app-card-padding-sm)] group/card-header @container/card-header grid auto-rows-min items-start has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto]",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("text-base font-medium", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        "px-[var(--app-card-padding)] group-data-[size=sm]/card:px-[var(--app-card-padding-sm)]",
        className,
      )}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "rounded-b-md px-[var(--app-card-padding)] group-data-[size=sm]/card:px-[var(--app-card-padding-sm)] [.border-t]:pt-[var(--app-card-padding)] group-data-[size=sm]/card:[.border-t]:pt-[var(--app-card-padding-sm)] flex items-center",
        className,
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
