import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRoundingStore } from '@/store/roundingStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/Button';
export function RoundingFooter({ onClose }) {
    const { saveDraft, saveRecord, currentRecord } = useRoundingStore();
    const { addToast, openSubModal } = useUIStore();
    const handleComplete = async () => {
        await saveRecord('completed');
        addToast('查房已完成', 'success');
        onClose();
    };
    const handleSaveDraft = async () => {
        await saveDraft();
        addToast('草稿已保存', 'info');
    };
    if (!currentRecord)
        return null;
    return (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: handleSaveDraft, children: "\u4FDD\u5B58\u8349\u7A3F" }), _jsx(Button, { size: "sm", onClick: handleComplete, children: "\u5B8C\u6210\u67E5\u623F" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => openSubModal('calculator', { patientId: currentRecord.patientId }), children: "\uD83D\uDD22 \u8BA1\u7B97\u5668" })] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: onClose, children: "\u5173\u95ED" })] }));
}
