interface BreadcrumbItem { label: string; onClick?: () => void; }

interface BreadcrumbProps { items: BreadcrumbItem[]; }

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)]">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-[var(--color-text-muted)]">/</span>}
          {item.onClick ? (
            <button onClick={item.onClick} className="font-ui hover:text-[var(--color-primary)] transition-colors">{item.label}</button>
          ) : (
            <span className="font-ui text-[var(--color-text)] font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
