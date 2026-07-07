interface DetailsInputProps { value: string; onChange: (text: string) => void; readonly?: boolean; }

export function DetailsInput({ value, onChange, readonly }: DetailsInputProps) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius)] p-3">
      <h4 className="font-ui text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">查房记录</h4>
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={readonly}
        rows={8}
        className="w-full text-sm resize-none font-ui bg-[var(--color-bg)]"
        placeholder="查房所见、病情变化、处理措施、明日计划…"
      />
    </div>
  );
}
