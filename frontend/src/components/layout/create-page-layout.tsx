import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLIcon } from "@/components/icons/vetdata-icons";
import { StepTracker, type Step } from "@/components/layout/step-tracker";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { cn } from "@/lib/utils";

interface CreatePageLayoutProps {
  title: string;
  steps: Step[];
  children: ReactNode;
  backTo?: string;
  showSidebar?: boolean;
  className?: string; // Class for the content container
}

export function CreatePageLayout({
  title,
  steps,
  children,
  backTo,
  showSidebar = true,
  className,
}: CreatePageLayoutProps) {
  const navigate = useNavigate();
  const sectionIds = steps.map((s) => s.id);
  const activeStep = useScrollSpy(sectionIds);

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-border px-4 py-5 sm:px-6">
        <button
          type="button"
          onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
          className="inline-flex items-center gap-1.5 rounded-full text-[12.5px] text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <ArrowLIcon size={14} />
          Voltar
        </button>
        <h1 className="mt-2 min-w-0 text-2xl leading-[30px] font-semibold tracking-[-0.01em] text-balance">
          {title}
        </h1>
      </div>

      <div className="flex flex-1">
        {showSidebar && (
          <aside className="hidden w-64 shrink-0 border-r border-border lg:block">
            <div className="sticky top-4 p-4">
              <StepTracker steps={steps} activeStep={activeStep} />
            </div>
          </aside>
        )}

        <main
          className="flex-1 overflow-y-auto px-4 py-5 sm:px-6"
          data-scroll-container
        >
          <div className={cn("mx-auto max-w-2xl space-y-8 pb-12", className)}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
