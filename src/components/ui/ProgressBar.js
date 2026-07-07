import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function ProgressBar({ value, color, showLabel, className = '', gradient }) {
    const clamped = Math.max(0, Math.min(100, value));
    const fillColor = color || 'var(--color-primary)';
    const bgStyle = gradient
        ? { background: `linear-gradient(90deg, ${fillColor}, var(--color-accent))` }
        : { backgroundColor: fillColor };
    return (_jsxs("div", { className: `flex items-center gap-2 ${className}`, children: [_jsx("div", { className: "flex-1 h-1.5 bg-[var(--color-border-light)] rounded-full overflow-hidden", children: _jsx("div", { className: "h-full rounded-full transition-all duration-500 ease-out", style: { width: `${clamped}%`, ...bgStyle } }) }), showLabel && _jsxs("span", { className: "font-data text-xs text-[var(--color-text-secondary)] min-w-[3ch] text-right", children: [Math.round(clamped), "%"] })] }));
}
