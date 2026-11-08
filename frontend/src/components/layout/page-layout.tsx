import type { ReactNode } from "react";

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  description?: ReactNode;
  actions?: ReactNode;
}

export function PageLayout({
  children,
  title,
  description,
  actions,
}: PageLayoutProps) {
  return (
    <div className="flex flex-1 flex-col gap-5 px-4 py-5 sm:px-6">
      {(title || actions) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {title && (
            <div className="min-w-0">
              <h1 className="text-2xl leading-[30px] font-semibold tracking-[-0.01em] text-balance">
                {title}
              </h1>
              {description && (
                <p className="mt-1 text-[13.5px] text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
          )}
          {actions && (
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
