import { cn } from "@/lib/utils"

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
  className?: string
}

export function StepIndicator({ currentStep, totalSteps, className }: StepIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm text-[var(--color-text-secondary)]">
        第 {currentStep}/{totalSteps} 步
      </span>
      <div className="flex gap-1">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-8 h-1 rounded-full transition-colors duration-200",
              i < currentStep
                ? "bg-[var(--color-accent)]"
                : "bg-[var(--color-border)]"
            )}
          />
        ))}
      </div>
    </div>
  )
}
