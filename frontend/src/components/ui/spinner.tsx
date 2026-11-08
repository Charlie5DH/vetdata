import { cn } from "@/lib/utils"
import { Loader2Icon } from "lucide-react"

// No spinner in the VetData icon set; lucide at stroke 1.75 (global CSS). Forest on its own, inherits inside buttons.
function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon role="status" aria-label="Loading" className={cn("size-4 animate-spin text-primary motion-reduce:animate-none [[data-slot=button]_&]:text-current", className)} {...props} />
  )
}

export { Spinner }
