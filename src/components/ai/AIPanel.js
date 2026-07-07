import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { usePatientStore } from '@/store/patientStore';
import { useRoundingStore } from '@/store/roundingStore';
import { useDeepSeek } from '@/hooks/useDeepSeek';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { StreamingText } from './StreamingText';
export function AIPanel({ patientId, recordId, onSave, onClose }) {
    const [patient, setPatient] = useState(null);
    const [record, setRecord] = useState(null);
    const [generated, setGenerated] = useState(false);
    const { getPatient } = usePatientStore();
    const { generateSummary, isGenerating, streamedText, error, abort } = useDeepSeek();
    const { saveRecord } = useRoundingStore();
    useEffect(() => {
        (async () => {
            const p = await getPatient(patientId);
            if (p)
                setPatient(p);
            // Get record from Dexie
            const { db } = await import('@/lib/db');
            const r = await db.roundingRecords.get(recordId);
            if (r)
                setRecord(r);
        })();
    }, [patientId, recordId, getPatient]);
    const handleGenerate = async () => {
        if (!patient || !record)
            return;
        try {
            await generateSummary(patient, record);
            setGenerated(true);
        }
        catch { /* error handled in hook */ }
    };
    const handleSave = async () => {
        if (!streamedText)
            return;
        const parts = streamedText.split('## 风险提示');
        const summary = parts[0] || '';
        const planAndRisk = parts.length > 1 ? parts[1] : '';
        const planParts = planAndRisk.split('## 诊疗计划');
        const risk = planParts[0]?.replace('## 诊疗计划', '').trim() || '';
        const plan = planParts.length > 1 ? planParts[1]?.trim() : planAndRisk.trim();
        await saveRecord('completed');
        onSave(streamedText);
        onClose();
    };
    if (!patient || !record)
        return null;
    return (_jsx(Modal, { isOpen: true, onClose: onClose, title: `AI 病情摘要 — ${patient.name}`, size: "md", footer: _jsxs("div", { className: "flex gap-2", children: [!generated && _jsx(Button, { onClick: handleGenerate, loading: isGenerating, children: isGenerating ? '生成中...' : '开始生成' }), generated && _jsx(Button, { variant: "outline", onClick: handleGenerate, loading: isGenerating, children: "\u91CD\u65B0\u751F\u6210" }), !isGenerating && streamedText && _jsx(Button, { onClick: () => navigator.clipboard.writeText(streamedText), variant: "ghost", children: "\u590D\u5236\u5168\u6587" }), generated && _jsx(Button, { onClick: handleSave, children: "\u4FDD\u5B58\u81F3\u67E5\u623F\u8BB0\u5F55" }), _jsx(Button, { variant: "ghost", onClick: onClose, children: "\u5173\u95ED" })] }), children: _jsxs("div", { className: "max-h-[55vh] overflow-y-auto", children: [!isGenerating && !streamedText && !error && (_jsx("p", { className: "text-sm text-[var(--color-text-muted)] text-center py-8", children: "\u70B9\u51FB\"\u5F00\u59CB\u751F\u6210\"\u8C03\u7528 DeepSeek AI \u5206\u6790\u67E5\u623F\u6570\u636E\uFF0C\u7ED3\u5408\u77E5\u8BC6\u5E93\u751F\u6210\u75C5\u60C5\u6458\u8981\u548C\u8BCA\u7597\u8BA1\u5212" })), error && (_jsx("div", { className: "p-3 rounded bg-[var(--color-error-bg)] border border-[var(--color-error)]/30 text-sm text-[var(--color-error)] mb-3", children: error })), _jsx(StreamingText, { text: streamedText, isStreaming: isGenerating })] }) }));
}
