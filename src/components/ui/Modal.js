import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
export function Modal({ isOpen, onClose, title, children, footer, size = 'md' }) {
    useEffect(() => {
        if (!isOpen)
            return;
        const onKey = (e) => { if (e.key === 'Escape')
            onClose(); };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
    }, [isOpen, onClose]);
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center", style: { backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }, onClick: onClose, children: _jsxs("div", { className: `bg-[var(--color-surface-elevated)] rounded-[var(--radius-lg)] border border-[var(--color-border)] max-h-[90vh] overflow-y-auto ${size === 'sm' ? 'w-[480px]' : 'w-[720px] lg:w-[860px]'} max-w-[95vw]`, style: { boxShadow: 'var(--shadow-elevated)' }, onClick: (e) => e.stopPropagation(), children: [title && (_jsxs("div", { className: "flex items-center justify-between px-5 py-3.5 border-b border-[var(--color-border)]", children: [_jsx("h2", { className: "font-ui text-lg font-semibold text-[var(--color-text)]", children: title }), _jsx("button", { onClick: onClose, className: "text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-xl leading-none transition-colors", children: "\u00D7" })] })), _jsx("div", { className: "px-5 py-4", children: children }), footer && _jsx("div", { className: "flex justify-end gap-2 px-5 py-3 border-t border-[var(--color-border)]", children: footer })] }) }));
}
