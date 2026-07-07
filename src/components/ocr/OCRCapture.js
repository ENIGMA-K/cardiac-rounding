import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef } from 'react';
import { runOCR } from '@/lib/ocr';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
export function OCRCapture({ patientId, onSave, onClose }) {
    const [image, setImage] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState('');
    const [error, setError] = useState('');
    const fileRef = useRef(null);
    const handleFile = async (file) => {
        setError('');
        setItems([]);
        const r = new FileReader();
        r.onload = (e) => setImage(e.target?.result);
        r.readAsDataURL(file);
        setLoading(true);
        setProgress('识别中（中英文，约10-30秒）...');
        try {
            const res = await runOCR(file);
            setItems(res.items);
        }
        catch (e) {
            setError('识别失败：' + e.message);
        }
        finally {
            setLoading(false);
            setProgress('');
        }
    };
    const handleCapture = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment';
        input.onchange = (e) => { const f = e.target.files?.[0]; if (f)
            handleFile(f); };
        input.click();
    };
    const categories = [...new Set(items.map(i => i.category))];
    return (_jsxs("div", { className: "flex flex-col gap-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "font-ui text-base font-bold text-[var(--color-text)]", children: "OCR \u5316\u9A8C\u5F55\u5165" }), _jsx(Button, { variant: "ghost", size: "sm", onClick: onClose, children: "\u5173\u95ED" })] }), !image && (_jsxs(Card, { className: "p-8 text-center", children: [_jsx("p", { className: "text-[var(--color-text-muted)] mb-4", children: "\u62CD\u7167\u6216\u9009\u62E9\u5316\u9A8C\u5355\u56FE\u7247\uFF0C\u81EA\u52A8\u8BC6\u522B\u6307\u6807" }), _jsxs("div", { className: "flex gap-3 justify-center", children: [_jsx(Button, { onClick: handleCapture, size: "lg", children: "\uD83D\uDCF7 \u62CD\u7167" }), _jsx(Button, { variant: "outline", size: "lg", onClick: () => fileRef.current?.click(), children: "\uD83D\uDCC1 \u9009\u56FE" }), _jsx("input", { ref: fileRef, type: "file", accept: "image/*", className: "hidden", onChange: (e) => { const f = e.target.files?.[0]; if (f)
                                    handleFile(f); } })] })] })), image && (_jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("img", { src: image, className: "w-full rounded-[var(--radius)] border border-[var(--color-border)]", alt: "\u5316\u9A8C\u5355" }), _jsxs("div", { className: "flex gap-2 mt-2", children: [_jsx(Button, { size: "sm", variant: "outline", onClick: handleCapture, children: "\u91CD\u62CD" }), _jsx(Button, { size: "sm", variant: "ghost", onClick: () => { setImage(null); setItems([]); }, children: "\u6E05\u9664" })] })] }), _jsxs("div", { children: [loading && _jsx("p", { className: "text-sm text-[var(--color-text-muted)]", children: progress }), error && _jsx("p", { className: "text-sm text-[var(--color-error)]", children: error }), items.length > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsxs("h4", { className: "font-ui text-sm font-semibold text-[var(--color-text)]", children: ["\u8BC6\u522B\u7ED3\u679C\uFF08", items.length, "\u9879\uFF09"] }), categories.map(cat => (_jsxs("div", { children: [_jsx("span", { className: "text-[10px] text-[var(--color-text-muted)]", children: cat }), _jsx("div", { className: "flex flex-wrap gap-1.5 mt-0.5", children: items.filter(i => i.category === cat).map((item, idx) => (_jsxs("span", { className: "font-data text-xs px-2 py-1 rounded bg-[var(--color-primary-light)] text-[var(--color-primary)]", children: [item.name, " ", item.value, item.unit] }, idx))) })] }, cat))), _jsx(Button, { size: "sm", onClick: () => onSave(items), className: "mt-2", children: "\u786E\u8BA4\u5BFC\u5165" })] }))] })] }))] }));
}
