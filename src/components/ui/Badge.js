import { jsx as _jsx } from "react/jsx-runtime";
import { PHASE_LABELS } from '@/types';
const phaseColors = {
    'pre-op': 'var(--phase-pre-op)', 'surgery-day': 'var(--phase-surgery-day)',
    'post-op-icu': 'var(--phase-post-op-icu)', 'post-op-ward-monitor': 'var(--phase-post-op-ward-monitor)',
    'post-op-ward': 'var(--phase-post-op-ward)', 'transfer': 'var(--phase-transfer)', 'discharged': 'var(--phase-discharged)',
};
export function Badge({ phase, label, color, variant = 'solid' }) {
    const bgColor = phase ? phaseColors[phase] : color || 'var(--color-border)';
    const text = label || (phase ? PHASE_LABELS[phase] : '');
    if (variant === 'subtle') {
        return (_jsx("span", { className: "font-ui inline-flex items-center rounded-full font-medium text-xs px-2 py-0.5", style: { backgroundColor: `${bgColor}20`, color: bgColor, border: `1px solid ${bgColor}30` }, children: text }));
    }
    return (_jsx("span", { className: "font-ui inline-flex items-center rounded-full text-white font-medium text-xs px-2 py-0.5", style: { backgroundColor: bgColor }, children: text }));
}
