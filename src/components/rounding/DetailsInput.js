import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function DetailsInput({ value, onChange, readonly }) {
    return (_jsxs("div", { className: "bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius)] p-3", children: [_jsx("h4", { className: "font-ui text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-2", children: "\u67E5\u623F\u8BB0\u5F55" }), _jsx("textarea", { value: value || '', onChange: (e) => onChange(e.target.value), disabled: readonly, rows: 8, className: "w-full text-sm resize-none font-ui bg-[var(--color-bg)]", placeholder: "\u67E5\u623F\u6240\u89C1\u3001\u75C5\u60C5\u53D8\u5316\u3001\u5904\u7406\u63AA\u65BD\u3001\u660E\u65E5\u8BA1\u5212\u2026" })] }));
}
