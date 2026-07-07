import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useUIStore } from '@/store/uiStore';
export function ToastContainer() {
    const toasts = useUIStore((s) => s.toasts);
    const removeToast = useUIStore((s) => s.removeToast);
    if (toasts.length === 0)
        return null;
    const styles = {
        success: { bg: 'var(--color-success-bg)', icon: '✓' },
        error: { bg: 'var(--color-error-bg)', icon: '✗' },
        info: { bg: 'var(--color-info-bg)', icon: 'ℹ' },
    };
    return (_jsx("div", { className: "fixed bottom-4 right-4 z-[100] flex flex-col gap-2", children: toasts.map((t) => {
            const s = styles[t.type] || styles.info;
            return (_jsxs("div", { className: "font-ui flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius)] text-sm cursor-pointer border border-[var(--color-border)]", style: { backgroundColor: s.bg, color: 'var(--color-text)' }, onClick: () => removeToast(t.id), children: [_jsx("span", { children: s.icon }), _jsx("span", { children: t.message })] }, t.id));
        }) }));
}
