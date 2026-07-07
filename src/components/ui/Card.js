import { jsx as _jsx } from "react/jsx-runtime";
export function Card({ children, hoverable, glow, className = '', ...props }) {
    return (_jsx("div", { className: `bg-[var(--color-surface)] rounded-[var(--radius)] border border-[var(--color-border)] ${glow ? 'card-glow' : ''} ${hoverable ? 'hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border-focus)] transition-colors cursor-pointer' : ''} ${className}`, ...props, children: children }));
}
