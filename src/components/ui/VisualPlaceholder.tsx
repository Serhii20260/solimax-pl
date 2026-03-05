type VisualPlaceholderProps = {
  label: string;
  className?: string;
  tone?: "light" | "dark";
};

export default function VisualPlaceholder({ label, className, tone = "light" }: VisualPlaceholderProps) {
  const base = [
    "relative flex w-full min-h-[320px] items-center justify-center rounded-2xl",
    tone === "dark"
      ? "bg-slate-800/80 text-white"
      : "bg-slate-100 text-slate-500",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const badgeClasses = [
    "pointer-events-none select-none rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em]",
    tone === "dark" ? "bg-white/15 text-white/90" : "bg-white text-slate-500 shadow-sm",
  ].join(" ");

  return (
    <div className={base}>
      <div className="absolute inset-0 rounded-2xl border border-white/20" aria-hidden="true" />
      <span className={badgeClasses}>{label}</span>
    </div>
  );
}
