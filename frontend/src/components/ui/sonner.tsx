"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { Loader2Icon } from "lucide-react"

import { AlertIcon, InfoIcon, OkIcon } from "@/components/icons/vetdata-icons"

// Sonner injects unlayered CSS for styled toasts, so the overrides below need `!`.
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <OkIcon className="text-success size-4" />,
        info: <InfoIcon className="text-info size-4" />,
        warning: <AlertIcon className="text-warning size-4" />,
        error: <AlertIcon className="text-destructive size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin text-stone-600" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "cn-toast bg-popover! text-popover-foreground! border-border! rounded-xl! gap-2.5! px-4! py-3.5! font-sans! text-[13.5px]! shadow-md!",
          title: "text-foreground! font-semibold! leading-snug!",
          description: "text-muted-foreground! leading-snug!",
          actionButton:
            "bg-primary! text-primary-foreground! h-[26px]! rounded-full! px-[11px]! font-sans! text-xs! font-semibold! hover:bg-forest-800!",
          cancelButton:
            "text-foreground! hover:bg-accent! h-[26px]! rounded-full! bg-transparent! px-[11px]! font-sans! text-xs! font-semibold!",
          closeButton: "bg-card! border-border! text-stone-600! hover:bg-accent!",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
