import { jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { LockScreen } from '@/components/layout/LockScreen';
import { AppShell } from '@/components/layout/AppShell';
export default function App() {
    const [appState, setAppState] = useState('loading');
    const { loadSettings, isUnlocked, lockSession } = useSettingsStore();
    useEffect(() => {
        const init = async () => {
            await loadSettings();
            const wasUnlocked = sessionStorage.getItem('cardiac_unlocked') === 'true';
            setAppState(wasUnlocked ? 'unlocked' : 'locked');
        };
        init();
    }, [loadSettings]);
    const handleUnlock = useCallback(() => {
        sessionStorage.setItem('cardiac_unlocked', 'true');
        setAppState('unlocked');
    }, []);
    const handleLock = useCallback(() => {
        sessionStorage.removeItem('cardiac_unlocked');
        lockSession();
        setAppState('locked');
    }, [lockSession]);
    if (appState === 'loading') {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-[var(--color-bg)]", children: _jsx("p", { className: "text-[var(--color-text-muted)]", style: { fontFamily: 'var(--font-body)' }, children: "\u52A0\u8F7D\u4E2D..." }) }));
    }
    if (appState === 'locked') {
        return _jsx(LockScreen, { onUnlock: handleUnlock });
    }
    return _jsx(AppShell, { onLock: handleLock });
}
