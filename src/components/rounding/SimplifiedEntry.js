import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
export function SimplifiedEntry({ patient, onSave }) {
    const [form, setForm] = useState({});
    const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    return (_jsxs("div", { className: "flex flex-col lg:flex-row gap-3", children: [_jsx("div", { className: "flex-1", children: _jsxs(Card, { className: "p-3", children: [_jsx("h4", { className: "font-ui text-sm font-semibold text-[var(--color-text)] mb-2", children: "\u5316\u9A8C\u68C0\u67E5" }), _jsx("div", { className: "grid grid-cols-2 gap-2 text-sm", children: [
                                ['血常规', ['hb', 'Hb (g/L)', 'wbc', 'WBC', 'plt', 'PLT', 'hct', 'HCT']],
                                ['生化', ['scr', 'Scr', 'k', 'K⁺', 'na', 'Na⁺', 'ca', 'Ca²⁺', 'glc', 'Glc']],
                                ['凝血', ['pt', 'PT (s)', 'inr', 'INR', 'ptt', 'PTT']],
                                ['血气', ['ph', 'pH', 'pao2', 'PaO₂', 'paco2', 'PaCO₂', 'lac', 'Lac']],
                            ].map(([cat, fields]) => (_jsxs("div", { className: "space-y-1", children: [_jsx("span", { className: "text-xs text-[var(--color-text-muted)] block", children: cat }), Array.from({ length: fields.length / 2 }, (_, i) => {
                                        const key = fields[i * 2];
                                        const label = fields[i * 2 + 1];
                                        return (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("span", { className: "text-xs w-12 text-[var(--color-text-secondary)]", children: label }), _jsx("input", { type: "number", value: form[key] || '', onChange: (e) => update(key, e.target.value), className: "font-data text-sm w-20 px-1.5 py-0.5 bg-[var(--color-bg)]" })] }, key));
                                    })] }, cat))) })] }) }), _jsxs("div", { className: "w-64 flex-shrink-0 space-y-2", children: [_jsxs(Card, { className: "p-3", children: [_jsx("h4", { className: "font-ui text-sm font-semibold text-[var(--color-text)] mb-1", children: "\u624B\u672F\u4FE1\u606F" }), _jsxs("div", { className: "text-xs text-[var(--color-text-secondary)] space-y-0.5", children: [_jsxs("div", { children: ["\u672F\u5F0F: ", patient.surgery?.surgeryType || '—'] }), _jsxs("div", { children: ["CPB: ", patient.surgery?.cpbTime || '—', " min"] }), _jsxs("div", { children: ["\u963B\u65AD: ", patient.surgery?.crossClampTime || '—', " min"] })] })] }), _jsxs(Card, { className: "p-3", children: [_jsx("h4", { className: "font-ui text-sm font-semibold text-[var(--color-text)] mb-1", children: "\u5E76\u53D1\u75C7" }), _jsx("textarea", { value: form['complications'] || '', onChange: (e) => update('complications', e.target.value), rows: 4, className: "w-full text-xs resize-none font-ui bg-[var(--color-bg)]", placeholder: "\u672F\u540E\u5E76\u53D1\u75C7\u8BB0\u5F55\u2026" })] }), _jsx(Button, { size: "sm", className: "w-full", onClick: () => onSave(form), children: "\u4FDD\u5B58" })] })] }));
}
