import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { IconArrowLeft } from "@tabler/icons-react";
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
      <div className="border-b px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
          >
            <IconArrowLeft className="size-4" />
          </Button>
          <h1 className="min-w-0 text-balance text-xl font-semibold">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex flex-1">
        {showSidebar && (
          <aside className="hidden w-64 shrink-0 border-r lg:block">
            <div className="sticky top-4 p-4">
              <StepTracker steps={steps} activeStep={activeStep} />
            </div>
          </aside>
        )}

        <main
          className="flex-1 overflow-y-auto p-4 sm:p-6"
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
