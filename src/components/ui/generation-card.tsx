import { cn } from "@/lib/utils"
import { Eye } from "lucide-react"

interface GenerationCardProps {
  imageUrl?: string
  selected?: boolean
  onClick?: () => void
  onPreview?: () => void
  className?: string
}

export function GenerationCard({
  imageUrl,
  selected,
  onClick,
  onPreview,
  className,
}: GenerationCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden bg-[var(--color-surface)] cursor-pointer",
        "shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
        "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        "hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-0.5",
        selected && "shadow-[0_0_0_3px_var(--color-accent)]",
        className
      )}
      onClick={onClick}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Generated"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-[#f5f5f5] animate-pulse-subtle" />
      )}

      {/* Preview button */}
      {imageUrl && onPreview && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onPreview()
          }}
          className={cn(
            "absolute top-3 right-3 w-9 h-9 rounded-full",
            "bg-white/90 backdrop-blur-sm shadow-sm",
            "flex items-center justify-center",
            "opacity-0 group-hover:opacity-100 transition-opacity",
            "hover:bg-white"
          )}
        >
          <Eye className="w-4 h-4 text-[var(--color-text-secondary)]" />
        </button>
      )}

      {/* Selected indicator */}
      {selected && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/5">
          <div className="px-4 py-2 bg-white rounded-full shadow-sm">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">
              已选择
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
