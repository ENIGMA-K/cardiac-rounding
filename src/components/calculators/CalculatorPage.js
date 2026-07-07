import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
export function CalculatorPage({ patientId, onTagSave, onClose }) {
    const [tab, setTab] = useState('vis');
    const handleTagSave = (tag) => {
        onTagSave?.(tag);
        onClose?.();
    };
    return (_jsxs("div", { className: "flex flex-col gap-4 max-w-xl", children: [onClose && (_jsx("div", { className: "flex items-center gap-2", children: _jsx("button", { onClick: onClose, className: "font-ui text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]", children: "\u2190 \u8FD4\u56DE\u67E5\u623F" }) })), !onTagSave && _jsx("h2", { className: "font-ui text-lg font-bold text-[var(--color-text)]", children: "\u4E34\u5E8A\u8BA1\u7B97\u5668" }), _jsx("div", { className: "flex flex-wrap gap-1.5", children: [
                    ['vis', 'VIS 血管活性药评分'],
                    ['euroscore', 'EuroSCORE II'],
                    ['crcl', 'CrCl 肌酐清除率'],
                    ['cha2ds2', 'CHA₂DS₂-VASc'],
                    ['hasbled', 'HAS-BLED'],
                ].map(([k, v]) => (_jsx("button", { onClick: () => setTab(k), className: `font-ui text-xs px-3 py-1.5 rounded-full transition-colors ${tab === k ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-[var(--color-primary)]'}`, children: v }, k))) }), tab === 'vis' && _jsx(VISCalc, { onTagSave: onTagSave ? handleTagSave : undefined }), tab === 'euroscore' && _jsx(EuroSCORE, { onTagSave: onTagSave ? handleTagSave : undefined }), tab === 'crcl' && _jsx(CrClCalc, { onTagSave: onTagSave ? handleTagSave : undefined }), tab === 'cha2ds2' && _jsx(CHA2DS2, { onTagSave: onTagSave ? handleTagSave : undefined }), tab === 'hasbled' && _jsx(HASBLED, { onTagSave: onTagSave ? handleTagSave : undefined })] }));
}
/* ─── VIS ─── */
const drugs = [
    { key: 'dopamine', label: '多巴胺', dflt: 200, unit: 'mg' },
    { key: 'dobutamine', label: '多巴酚丁胺', dflt: 200, unit: 'mg' },
    { key: 'epinephrine', label: '肾上腺素', dflt: 4, unit: 'mg' },
    { key: 'norepinephrine', label: '去甲肾上腺素', dflt: 8, unit: 'mg' },
    { key: 'milrinone', label: '米力农', dflt: 10, unit: 'mg' },
    { key: 'vasopressin', label: '血管加压素', dflt: 20, unit: 'U' },
];
function TagBtn({ label, value, onTagSave }) {
    if (!onTagSave)
        return null;
    return _jsx(Button, { size: "sm", variant: "outline", className: "mt-2", onClick: () => onTagSave(`${label}=${value}`), children: "\uD83D\uDCCC \u4FDD\u5B58\u4E3A\u6807\u7B7E" });
}
function VISCalc({ onTagSave }) {
    const [weight, setWeight] = useState('70');
    const [state, setState] = useState(Object.fromEntries(drugs.map(d => [d.key, { dose: '', rate: '' }])));
    const [result, setResult] = useState(null);
    const calc = () => {
        const w = parseFloat(weight) || 70;
        let vis = 0;
        for (const d of drugs) {
            const s = state[d.key];
            const dose = parseFloat(s.dose) || 0;
            const rate = parseFloat(s.rate) || 0;
            if (dose <= 0 || rate <= 0)
                continue;
            const v = d.unit === 'U' ? dose * rate / (50 * 60 * w) : (dose * 1000 * rate) / (50 * 60 * w);
            const m = { dopamine: 1, dobutamine: 1, epinephrine: 100, norepinephrine: 100, milrinone: 10, vasopressin: 10000 };
            vis += v * (m[d.key] || 1);
        }
        setResult({ vis: Math.round(vis * 10) / 10 });
    };
    return (_jsxs(Card, { className: "p-4", children: [_jsx("h4", { className: "font-ui text-sm font-semibold text-[var(--color-text)] mb-3", children: "VIS \u8840\u7BA1\u6D3B\u6027\u836F\u7269\u8BC4\u5206" }), _jsxs("div", { className: "mb-3", children: [_jsx("label", { className: "text-xs text-[var(--color-text-secondary)]", children: "\u4F53\u91CD (kg)" }), _jsx("input", { type: "number", value: weight, onChange: e => setWeight(e.target.value), className: "font-data text-sm w-24 ml-2" })] }), drugs.map(d => (_jsxs("div", { className: "flex items-center gap-2 text-xs mb-1", children: [_jsx("span", { className: "w-20 text-[var(--color-text-secondary)]", children: d.label }), _jsx("input", { type: "number", placeholder: String(d.dflt), value: state[d.key].dose, onChange: e => setState(p => ({ ...p, [d.key]: { ...p[d.key], dose: e.target.value } })), className: "font-data w-14 px-1 py-0.5 text-xs" }), _jsx("span", { className: "text-[var(--color-text-muted)] w-5", children: d.unit }), _jsx("span", { className: "text-[var(--color-text-muted)]", children: "\u6CF5\u901F" }), _jsx("input", { type: "number", placeholder: "0", value: state[d.key].rate, onChange: e => setState(p => ({ ...p, [d.key]: { ...p[d.key], rate: e.target.value } })), className: "font-data w-14 px-1 py-0.5 text-xs" }), _jsx("span", { className: "text-[var(--color-text-muted)]", children: "mL/h" })] }, d.key))), _jsx("div", { className: "flex gap-2 mt-3", children: _jsx(Button, { size: "sm", onClick: calc, children: "\u8BA1\u7B97" }) }), result && _jsxs("div", { className: "mt-3 text-center", children: [_jsx("div", { className: "font-data text-4xl font-bold text-[var(--color-primary)]", children: result.vis.toFixed(1) }), _jsx("div", { className: "text-xs text-[var(--color-text-muted)] mt-1", children: "0-5 \u8F7B\u5EA6 \u00B7 5-15 \u4E2D\u5EA6 \u00B7 15-30 \u4E2D\u91CD\u5EA6 \u00B7 >30 \u91CD\u5EA6" }), _jsx(TagBtn, { label: "VIS", value: result.vis.toFixed(1), onTagSave: onTagSave })] })] }));
}
/* ─── EuroSCORE II ─── */
const euroFields = [
    { key: 'age', label: '年龄 ≥ 60', points: 1 },
    { key: 'female', label: '女性', points: 1 },
    { key: 'copd', label: '慢性肺病/COPD', points: 2 },
    { key: 'arterial', label: '心外动脉疾病', points: 2 },
    { key: 'neuro', label: '神经系统功能障碍', points: 2 },
    { key: 'prevSurg', label: '既往心脏手术', points: 3 },
    { key: 'crea200', label: '术前肌酐 > 200 μmol/L', points: 2 },
    { key: 'endocarditis', label: '活动性心内膜炎', points: 3 },
    { key: 'critical', label: '术前危急状态', points: 3 },
    { key: 'unstable', label: '不稳定心绞痛', points: 2 },
    { key: 'lvEF30', label: 'LVEF 30-50%', points: 1 },
    { key: 'lvEF30severe', label: 'LVEF < 30%', points: 3 },
    { key: 'mi90', label: '近期心梗 (< 90天)', points: 2 },
    { key: 'pasp60', label: '肺动脉高压 (PASP > 60mmHg)', points: 2 },
    { key: 'emergency', label: '急诊手术', points: 2 },
    { key: 'cabgOnly', label: '单纯CABG', points: -1 },
    { key: 'thoracic', label: '胸主动脉手术', points: 3 },
    { key: 'postMiVSD', label: '心梗后室间隔穿孔', points: 4 },
];
function EuroSCORE({ onTagSave }) {
    const [checks, setChecks] = useState({});
    const toggle = (k) => setChecks(c => ({ ...c, [k]: !c[k] }));
    const total = euroFields.filter(f => checks[f.key]).reduce((s, f) => s + f.points, 0);
    const risk = total <= 2 ? '低危 (<2%)' : total <= 5 ? '中危 (3-5%)' : total <= 8 ? '高危 (6-10%)' : '极高危 (>10%)';
    return (_jsxs(Card, { className: "p-4", children: [_jsx("h4", { className: "font-ui text-sm font-semibold text-[var(--color-text)] mb-3", children: "EuroSCORE II\uFF08\u7B80\u5316\uFF09" }), _jsx("div", { className: "grid grid-cols-2 gap-x-3 gap-y-1", children: euroFields.map(f => (_jsxs("label", { className: "flex items-center gap-2 text-xs text-[var(--color-text-secondary)] cursor-pointer py-0.5", children: [_jsx("input", { type: "checkbox", checked: !!checks[f.key], onChange: () => toggle(f.key), className: "w-3.5 h-3.5" }), f.label, " (", f.points > 0 ? '+' : '', f.points, ")"] }, f.key))) }), _jsxs("div", { className: "mt-4 text-center", children: [_jsx("div", { className: "font-data text-3xl font-bold text-[var(--color-primary)]", children: total }), _jsx("div", { className: "text-sm mt-1 text-[var(--color-text-secondary)]", children: risk }), _jsx("div", { className: "text-xs text-[var(--color-text-muted)] mt-1", children: "\u603B\u5206 0-22 \u00B7 \u5206\u6570\u8D8A\u9AD8\u98CE\u9669\u8D8A\u5927" }), _jsx(TagBtn, { label: "EuroSCORE", value: String(total), onTagSave: onTagSave })] })] }));
}
/* ─── CrCl (Cockcroft-Gault) ─── */
function CrClCalc({ onTagSave }) {
    const [age, setAge] = useState('65');
    const [weight, setWeight] = useState('70');
    const [scr, setScr] = useState('1.0');
    const [gender, setGender] = useState('m');
    const crcl = scr ? Math.round(((140 - (parseInt(age) || 65)) * (parseFloat(weight) || 70)) / (72 * parseFloat(scr)) * (gender === 'f' ? 0.85 : 1)) : 0;
    return (_jsxs(Card, { className: "p-4", children: [_jsx("h4", { className: "font-ui text-sm font-semibold text-[var(--color-text)] mb-3", children: "CrCl \u808C\u9150\u6E05\u9664\u7387 (Cockcroft-Gault)" }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs text-[var(--color-text-secondary)]", children: "\u5E74\u9F84" }), _jsx("input", { type: "number", value: age, onChange: e => setAge(e.target.value), className: "font-data text-sm" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs text-[var(--color-text-secondary)]", children: "\u4F53\u91CD (kg)" }), _jsx("input", { type: "number", value: weight, onChange: e => setWeight(e.target.value), className: "font-data text-sm" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs text-[var(--color-text-secondary)]", children: "Scr (mg/dL)" }), _jsx("input", { type: "number", step: "0.01", value: scr, onChange: e => setScr(e.target.value), className: "font-data text-sm" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs text-[var(--color-text-secondary)]", children: "\u6027\u522B" }), _jsxs("select", { value: gender, onChange: e => setGender(e.target.value), className: "text-sm", children: [_jsx("option", { value: "m", children: "\u7537" }), _jsx("option", { value: "f", children: "\u5973" })] })] })] }), _jsxs("div", { className: "mt-4 text-center", children: [_jsx("div", { className: "font-data text-3xl font-bold text-[var(--color-primary)]", children: crcl }), _jsx("div", { className: "text-sm text-[var(--color-text-secondary)]", children: "mL/min" }), _jsx(TagBtn, { label: "CrCl", value: String(crcl), onTagSave: onTagSave })] })] }));
}
/* ─── CHA₂DS₂-VASc ─── */
const chaFields = [
    { key: 'chf', label: '心衰/EF ≤ 40%', points: 1 },
    { key: 'htn', label: '高血压', points: 1 },
    { key: 'age75', label: '年龄 ≥ 75岁', points: 2 },
    { key: 'dm', label: '糖尿病', points: 1 },
    { key: 'stroke', label: '卒中/TIA/血栓', points: 2 },
    { key: 'vascular', label: '血管疾病', points: 1 },
    { key: 'age65', label: '年龄 65-74岁', points: 1 },
    { key: 'female', label: '女性', points: 1 },
];
function CHA2DS2({ onTagSave }) {
    const [checks, setChecks] = useState({});
    const toggle = (k) => setChecks(c => ({ ...c, [k]: !c[k] }));
    const total = chaFields.filter(f => checks[f.key]).reduce((s, f) => s + f.points, 0);
    const rec = total === 0 ? '无需抗凝' : total === 1 ? '考虑抗凝' : '建议抗凝';
    const strokeRisk = total === 0 ? '0%' : total === 1 ? '1.3%' : total === 2 ? '2.2%' : total === 3 ? '3.2%' : total === 4 ? '4.0%' : total === 5 ? '6.7%' : total >= 6 ? '9.8%+' : '';
    return (_jsxs(Card, { className: "p-4", children: [_jsx("h4", { className: "font-ui text-sm font-semibold text-[var(--color-text)] mb-3", children: "CHA\u2082DS\u2082-VASc \u8BC4\u5206" }), chaFields.map(f => (_jsxs("label", { className: "flex items-center gap-2 text-xs text-[var(--color-text-secondary)] py-0.5 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: !!checks[f.key], onChange: () => toggle(f.key), className: "w-3.5 h-3.5" }), f.label, " (", f.points, "\u5206)"] }, f.key))), _jsxs("div", { className: "mt-4 text-center", children: [_jsx("div", { className: "font-data text-3xl font-bold text-[var(--color-primary)]", children: total }), _jsxs("div", { className: "text-sm mt-1 text-[var(--color-text-secondary)]", children: [rec, " \u00B7 \u5E74\u5352\u4E2D\u98CE\u9669 ", strokeRisk] }), _jsx(TagBtn, { label: "CHA2DS2", value: String(total), onTagSave: onTagSave })] })] }));
}
/* ─── HAS-BLED ─── */
const hasbledFields = [
    { key: 'htn', label: '高血压 (SBP > 160)', points: 1 },
    { key: 'renal', label: '肾功能异常', points: 1 },
    { key: 'liver', label: '肝功能异常', points: 1 },
    { key: 'stroke', label: '卒中史', points: 1 },
    { key: 'bleed', label: '出血史/倾向', points: 1 },
    { key: 'labile', label: 'INR不稳定', points: 1 },
    { key: 'elderly', label: '年龄 > 65岁', points: 1 },
    { key: 'drugs', label: '抗血小板药/NSAIDs', points: 1 },
    { key: 'alcohol', label: '酗酒', points: 1 },
];
function HASBLED({ onTagSave }) {
    const [checks, setChecks] = useState({});
    const toggle = (k) => setChecks(c => ({ ...c, [k]: !c[k] }));
    const total = hasbledFields.filter(f => checks[f.key]).length;
    const risk = total < 2 ? '低出血风险' : total >= 3 ? '高出血风险（需谨慎）' : '中等风险';
    return (_jsxs(Card, { className: "p-4", children: [_jsx("h4", { className: "font-ui text-sm font-semibold text-[var(--color-text)] mb-3", children: "HAS-BLED \u51FA\u8840\u98CE\u9669\u8BC4\u5206" }), hasbledFields.map(f => (_jsxs("label", { className: "flex items-center gap-2 text-xs text-[var(--color-text-secondary)] py-0.5 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: !!checks[f.key], onChange: () => toggle(f.key), className: "w-3.5 h-3.5" }), f.label] }, f.key))), _jsxs("div", { className: "mt-4 text-center", children: [_jsx("div", { className: "font-data text-3xl font-bold", style: { color: total >= 3 ? 'var(--color-error)' : 'var(--color-primary)' }, children: total }), _jsx("div", { className: "text-sm mt-1 text-[var(--color-text-secondary)]", children: risk }), _jsx("div", { className: "text-xs text-[var(--color-text-muted)] mt-1", children: "\u22653\u5206\u63D0\u793A\u9AD8\u51FA\u8840\u98CE\u9669" }), _jsx(TagBtn, { label: "HASBLED", value: String(total), onTagSave: onTagSave })] })] }));
}
