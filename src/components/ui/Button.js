import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const variants = {
    primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]',
    outline: 'border border-[var(--color-border)] bg-transparent text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]',
    danger: 'bg-[var(--color-error-bg)] text-[var(--color-error)] border border-[var(--color-error)]/30 hover:bg-[var(--color-error)]/20',
    ghost: 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]',
    accent: 'bg-[var(--color-accent-light)] text-[var(--color-accent)] border border-[var(--color-accent)]/30 hover:bg-[var(--color-accent)]/20',
};
const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-[var(--radius-sm)]',
    md: 'px-4 py-2 text-sm rounded-[var(--radius-sm)]',
    lg: 'px-6 py-3 text-base rounded-[var(--radius)]',
};
export function Button({ variant = 'primary', size = 'md', loading, disabled, children, className = '', ...props }) {
    return (_jsxs("button", { className: `font-ui inline-flex items-center justify-center gap-1.5 font-semibold transition-all duration-[var(--duration-fast)] min-h-[44px] ${variants[variant]} ${sizes[size]} ${disabled || loading ? 'opacity-40 cursor-not-allowed' : ''} ${className}`, disabled: disabled || loading, ...props, children: [loading && _jsx("span", { className: "inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" }), children] }));
}
