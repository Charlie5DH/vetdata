import { cn } from "@/lib/utils";
import { CheckIcon } from "@/components/icons/vetdata-icons";

export interface Step {
  id: string;
  label: string;
}

interface StepTrackerProps {
  steps: Step[];
  activeStep: string;
  interactive?: boolean;
  onStepClick?: (id: string) => void;
  completedSteps?: string[];
}

function scrollToSection(id: string) {
  const element = document.getElementById(id);

  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function StepTracker({
  steps,
  activeStep,
  interactive = true,
  onStepClick,
  completedSteps,
}: StepTrackerProps) {
  const activeIndex = steps.findIndex((s) => s.id === activeStep);
  const completedStepSet = new Set(completedSteps ?? []);

  return (
    <nav className="relative">
      {/* 1px track joining the node centers (px-3 + half a 32px node = 28px). */}
      <div className="absolute top-7 bottom-7 left-[27.5px] z-[1] w-px bg-input" />

      <div className="flex flex-col gap-1">
        {steps.map((step, index) => {
          const isActive = step.id === activeStep;
          const isCompleted = completedSteps
            ? completedStepSet.has(step.id)
            : index < activeIndex;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => {
                if (!interactive) {
                  return;
                }

                if (onStepClick) {
                  onStepClick(step.id);
                  return;
                }

                scrollToSection(step.id);
              }}
              disabled={!interactive}
              aria-current={isActive ? "step" : undefined}
              className={cn(
                "relative grid min-h-14 grid-cols-[32px_1fr] items-center gap-3 rounded-lg px-3 py-3 text-left text-[13.5px] outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50",
                isActive || isCompleted
                  ? "font-semibold text-foreground"
                  : "text-stone-400",
                interactive && "hover:bg-muted",
                interactive && !isActive && !isCompleted && "hover:text-foreground",
                !interactive && "cursor-default",
              )}
            >
              <span
                className={cn(
                  "relative z-10 flex size-8 items-center justify-center rounded-full text-xs font-semibold tabular-nums",
                  isActive
                    ? "bg-primary text-cta"
                    : isCompleted
                      ? "bg-muted text-foreground"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {isCompleted && !isActive ? <CheckIcon size={14} /> : index + 1}
              </span>
              <span>{step.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
