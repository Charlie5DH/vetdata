import { cn } from "@/lib/utils"

function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "bg-muted text-stone-600 border-input [[data-slot=tooltip-content]_&]:bg-forest-700 [[data-slot=tooltip-content]_&]:border-forest-600 [[data-slot=tooltip-content]_&]:text-forest-200 w-fit min-w-5 gap-1 rounded-[5px] border border-b-2 px-1.5 py-0.5 font-mono text-[11px] leading-none font-medium whitespace-nowrap [&_svg:not([class*='size-'])]:size-3 pointer-events-none inline-flex items-center justify-center select-none",
        className
      )}
      {...props}
    />
  )
}

function KbdGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn("gap-1 inline-flex items-center", className)}
      {...props}
    />
  )
}

export { Kbd, KbdGroup }
