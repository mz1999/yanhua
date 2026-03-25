import { cn } from "@/lib/utils"

interface OptionCardProps {
  label: string
  selected?: boolean
  onClick?: () => void
  className?: string
}

export function OptionCard({ label, selected, onClick, className }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-5 py-4 rounded-xl border text-left transition-all duration-150 cursor-pointer",
        "border-[var(--color-border)] bg-[var(--color-surface)]",
        "hover:border-[var(--color-border-hover)]",
        selected && [
          "border-[var(--color-accent)] bg-[#fafafa]",
          "shadow-[0_0_0_1px_var(--color-accent)]",
        ],
        className
      )}
    >
      <span className={cn(
        "text-sm font-medium",
        selected ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"
      )}>
        {label}
      </span>
    </button>
  )
}
