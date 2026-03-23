import type { ReactNode } from "react";

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  actions?: ReactNode;
}

export function PageLayout({ children, title, actions }: PageLayoutProps) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
      {(title || actions) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {title && (
            <h1 className="text-2xl font-bold text-balance">{title}</h1>
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
