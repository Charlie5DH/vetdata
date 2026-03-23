import { cn } from "@/lib/utils";
import { IconCircle, IconCircleCheckFilled } from "@tabler/icons-react";

export interface Step {
  id: string;
  label: string;
}

const TRACK_LEFT = 24;
const TRACK_TOP = 24;

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
  const progressHeight =
    steps.length > 1 ? `${(activeIndex / (steps.length - 1)) * 100}%` : "0%";

  return (
    <nav className="relative">
      <div
        className="absolute bottom-6 w-px bg-border"
        style={{ left: TRACK_LEFT, top: TRACK_TOP }}
      />
      <div
        className="absolute w-px bg-primary transition-all duration-300"
        style={{ left: TRACK_LEFT, top: TRACK_TOP, height: progressHeight }}
      />

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
              className={cn(
                "relative grid min-h-12 grid-cols-[24px_1fr] items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                isActive && "bg-primary/10 text-foreground font-semibold",
                !isActive &&
                  interactive &&
                  "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                !interactive && "cursor-default",
                !interactive && !isActive && "text-muted-foreground",
              )}
            >
              <span className="relative z-10 flex size-6 items-center justify-center rounded-full bg-background">
                {isCompleted ? (
                  <IconCircleCheckFilled className="size-5 text-primary" />
                ) : (
                  <IconCircle
                    className={cn(
                      "size-5 transition-colors",
                      isActive
                        ? "text-primary fill-primary/20"
                        : "text-muted-foreground/50",
                    )}
                    style={isActive ? { strokeWidth: 2 } : undefined}
                  />
                )}
              </span>
              <span
                className={cn(
                  "transition-colors",
                  isActive && "text-primary font-semibold",
                )}
              >
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
