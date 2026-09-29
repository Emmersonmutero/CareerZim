import { cn } from "@/lib/cn";

/**
 * The CareerZim "Z" mark. Extracted so the sidebar, the chat avatars and the
 * empty-state greeting all share one source of truth for the brand mark.
 */
export function LogoMark({ size = 40, className }: { size?: number; className?: string }) {
  const px = `${size}px`;
  return (
    <div
      aria-hidden
      style={{ width: px, height: px }}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-950 font-display font-extrabold text-white",
        className,
      )}
    >
      <span style={{ fontSize: `${Math.round(size * 0.46)}px`, lineHeight: 1 }}>Z</span>
    </div>
  );
}
