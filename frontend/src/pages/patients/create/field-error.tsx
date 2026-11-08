import { AlertIcon } from "@/components/icons/vetdata-icons";

/** 12px field error with an alert icon (DESIGN.md §9). */
export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-destructive">
      <AlertIcon size={12} className="shrink-0" />
      {message}
    </p>
  );
}
