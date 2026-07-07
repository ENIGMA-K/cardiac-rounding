import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Breadcrumb({ items }) {
    return (_jsx("nav", { className: "flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)]", children: items.map((item, i) => (_jsxs("span", { className: "flex items-center gap-1.5", children: [i > 0 && _jsx("span", { className: "text-[var(--color-text-muted)]", children: "/" }), item.onClick ? (_jsx("button", { onClick: item.onClick, className: "font-ui hover:text-[var(--color-primary)] transition-colors", children: item.label })) : (_jsx("span", { className: "font-ui text-[var(--color-text)] font-medium", children: item.label }))] }, i))) }));
}
