import type { ReactNode } from "react";

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  actions?: ReactNode;
}

export function PageLayout({ children, title, actions }: PageLayoutProps) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      {(title || actions) && (
        <div className="flex items-center justify-between">
          {title && <h1 className="text-2xl font-bold">{title}</h1>}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
