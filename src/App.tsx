import { useState, useEffect, useCallback } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { LockScreen } from '@/components/layout/LockScreen';
import { AppShell } from '@/components/layout/AppShell';

type AppState = 'loading' | 'locked' | 'unlocked';

export default function App() {
  const [appState, setAppState] = useState<AppState>('loading');
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <p className="text-[var(--color-text-muted)]" style={{fontFamily:'var(--font-body)'}}>加载中...</p>
      </div>
    );
  }

  if (appState === 'locked') {
    return <LockScreen onUnlock={handleUnlock} />;
  }

  return <AppShell onLock={handleLock} />;
}
