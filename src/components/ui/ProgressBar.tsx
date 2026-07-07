interface ProgressBarProps { value: number; color?: string; showLabel?: boolean; className?: string; gradient?: boolean; }

export function ProgressBar({ value, color, showLabel, className = '', gradient }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const fillColor = color || 'var(--color-primary)';
  const bgStyle = gradient
    ? { background: `linear-gradient(90deg, ${fillColor}, var(--color-accent))` }
    : { backgroundColor: fillColor };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 h-1.5 bg-[var(--color-border-light)] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${clamped}%`, ...bgStyle }} />
      </div>
      {showLabel && <span className="font-data text-xs text-[var(--color-text-secondary)] min-w-[3ch] text-right">{Math.round(clamped)}%</span>}
    </div>
  );
}
