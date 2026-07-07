import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
export function LockScreen({ onUnlock }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [shaking, setShaking] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resetting, setResetting] = useState(false);
    const { verifyUserPassword, settings } = useSettingsStore();
    const handleReset = async () => {
        if (!settings.passwordHash)
            return;
        if (!confirm('重置密码不会丢失患者数据。\n下次登录时输入新密码即可。\n\n确认重置？'))
            return;
        setResetting(true);
        try {
            const { db } = await import('@/lib/db');
            await db.transaction('rw', db.settings, async () => {
                await db.settings.delete('passwordHash');
                await db.settings.delete('passwordSalt');
            });
            window.location.reload();
        }
        catch (e) {
            setError('重置失败');
        }
        finally {
            setResetting(false);
        }
    };
    const handleUnlock = async () => {
        if (loading)
            return;
        setLoading(true);
        setError('');
        try {
            const ok = await verifyUserPassword(password);
            if (ok) {
                onUnlock();
                setPassword('');
            }
            else {
                setError('密码错误，请重试');
                setShaking(true);
                setTimeout(() => setShaking(false), 400);
            }
        }
        catch (e) {
            setError(e.message || '验证失败');
        }
        finally {
            setLoading(false);
        }
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter')
            handleUnlock();
    };
    return (_jsx("div", { className: "h-screen flex items-center justify-center bg-[var(--color-bg)]", children: _jsxs("div", { className: "text-center px-6", children: [_jsx("div", { className: "text-5xl mb-4", children: "\uD83D\uDD12" }), _jsx("h1", { className: "font-ui text-2xl font-bold text-gradient mb-1", children: "\u5FC3\u810F\u5916\u79D1\u56F4\u672F\u671F" }), _jsx("h2", { className: "font-ui text-base text-[var(--color-text-secondary)] mb-10", children: "\u60A3\u8005\u7BA1\u7406\u7CFB\u7EDF" }), _jsxs("div", { className: `flex flex-col items-center gap-4 ${shaking ? 'animate-[shake_400ms_ease-in-out]' : ''}`, children: [_jsx("input", { type: "password", value: password, onChange: (e) => { setPassword(e.target.value); setError(''); }, onKeyDown: handleKeyDown, placeholder: "\u8BF7\u8F93\u5165\u89E3\u9501\u5BC6\u7801", className: "font-ui w-64 text-center py-3 text-base", autoFocus: true, inputMode: "text", enterKeyHint: "go" }), _jsx("button", { onClick: handleUnlock, disabled: loading, className: "font-ui w-64 py-3 bg-[var(--color-primary)] text-white rounded-[var(--radius)] font-semibold hover:bg-[var(--color-primary-dark)] transition-colors text-base disabled:opacity-50", style: { minHeight: 48 }, children: loading ? '验证中...' : '解锁' }), error && _jsx("p", { className: "text-[var(--color-error)] text-sm", children: error })] }), !settings.passwordHash ? (_jsx("p", { className: "mt-10 text-sm text-[var(--color-text-muted)]", children: "\u9996\u6B21\u4F7F\u7528\uFF0C\u8F93\u5165\u4EFB\u610F\u5BC6\u7801\u5B8C\u6210\u8BBE\u7F6E" })) : (_jsxs("div", { className: "mt-10 space-y-1", children: [_jsx("p", { className: "text-sm text-[var(--color-text-muted)]", children: "\u8BF7\u8F93\u5165\u5DF2\u8BBE\u7F6E\u7684\u89E3\u9501\u5BC6\u7801" }), _jsx("button", { onClick: handleReset, disabled: resetting, className: "text-xs text-[var(--color-text-muted)] hover:text-[var(--color-error)] underline transition-colors", children: resetting ? '重置中...' : '忘记密码？' })] }))] }) }));
}
