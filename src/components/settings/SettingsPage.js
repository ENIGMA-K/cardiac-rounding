import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { useUIStore } from '@/store/uiStore';
import { exportAllData, importAllData } from '@/lib/db';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
export function SettingsPage() {
    const { settings, setPassword, verifyUserPassword, updateSetting } = useSettingsStore();
    const { addToast } = useUIStore();
    const [oldPw, setOldPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const handleChangePassword = async () => {
        if (!newPw || newPw !== confirmPw) {
            addToast('两次密码不一致', 'error');
            return;
        }
        if (settings.passwordHash) {
            const ok = await verifyUserPassword(oldPw);
            if (!ok) {
                addToast('原密码错误', 'error');
                return;
            }
        }
        await setPassword(newPw);
        addToast('密码已修改', 'success');
        setOldPw('');
        setNewPw('');
        setConfirmPw('');
    };
    const handleLockChange = (mins) => { updateSetting('autoLockMinutes', mins); addToast(`自动锁定: ${mins} 分钟`, 'info'); };
    const handleExport = async () => {
        const json = await exportAllData();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cardiac-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        addToast('数据已导出', 'success');
    };
    const handleImport = async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = e.target.files?.[0];
            if (!file)
                return;
            const text = await file.text();
            if (confirm('导入将覆盖当前所有数据，确认？')) {
                await importAllData(text);
                addToast('数据已导入，请刷新页面', 'success');
            }
        };
        input.click();
    };
    return (_jsxs("div", { className: "flex flex-col gap-4 max-w-lg", children: [_jsx("h2", { className: "font-ui text-lg font-bold text-[var(--color-text)]", children: "\u8BBE\u7F6E" }), _jsxs(Card, { className: "p-4", children: [_jsx("h4", { className: "font-ui text-sm font-semibold text-[var(--color-text)] mb-2", children: "\u670D\u52A1\u5668\u5730\u5740" }), _jsx("p", { className: "text-xs text-[var(--color-text-muted)] mb-1", children: "IP \u53D8\u5316\u65F6\u8F93\u5165\u65B0\u5730\u5740\uFF0C\u70B9\"\u66F4\u65B0\"\u91CD\u65B0\u52A0\u8F7D" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { id: "serverUrl", defaultValue: window.location.origin, className: "font-data text-sm flex-1" }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => { navigator.clipboard.writeText(window.location.origin); addToast('已复制', 'info'); }, children: "\u590D\u5236" }), _jsx(Button, { size: "sm", onClick: () => { const el = document.getElementById('serverUrl'); if (el?.value)
                                    window.location.href = el.value; }, children: "\u66F4\u65B0" })] })] }), _jsxs(Card, { className: "p-4", children: [_jsx("h4", { className: "font-ui text-sm font-semibold text-[var(--color-text)] mb-2", children: "\u4FEE\u6539\u5BC6\u7801" }), _jsxs("div", { className: "space-y-2", children: [settings.passwordHash && _jsx("input", { type: "password", value: oldPw, onChange: (e) => setOldPw(e.target.value), placeholder: "\u539F\u5BC6\u7801" }), _jsx("input", { type: "password", value: newPw, onChange: (e) => setNewPw(e.target.value), placeholder: "\u65B0\u5BC6\u7801" }), _jsx("input", { type: "password", value: confirmPw, onChange: (e) => setConfirmPw(e.target.value), placeholder: "\u786E\u8BA4\u65B0\u5BC6\u7801" }), _jsx(Button, { size: "sm", onClick: handleChangePassword, children: "\u4FEE\u6539\u5BC6\u7801" })] })] }), _jsxs(Card, { className: "p-4", children: [_jsx("h4", { className: "font-ui text-sm font-semibold text-[var(--color-text)] mb-2", children: "\u81EA\u52A8\u9501\u5B9A" }), _jsx("div", { className: "flex gap-2", children: [5, 10, 15, 30, 60].map((m) => (_jsxs(Button, { size: "sm", variant: settings.autoLockMinutes === m ? 'primary' : 'outline', onClick: () => handleLockChange(m), children: [m, " \u5206\u949F"] }, m))) })] }), _jsxs(Card, { className: "p-4", children: [_jsx("h4", { className: "font-ui text-sm font-semibold text-[var(--color-text)] mb-2", children: "\u6570\u636E\u7BA1\u7406" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { size: "sm", variant: "outline", onClick: handleExport, children: "\u5BFC\u51FA JSON \u5907\u4EFD" }), _jsx(Button, { size: "sm", variant: "outline", onClick: handleImport, children: "\u5BFC\u5165 JSON \u5907\u4EFD" })] })] })] }));
}
