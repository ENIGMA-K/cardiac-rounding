import { useState } from 'react';
import { useSettingsStore } from '@/store/settingsStore';

interface LockScreenProps { onUnlock: () => void; }

export function LockScreen({ onUnlock }: LockScreenProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const { verifyUserPassword, settings } = useSettingsStore();

  const handleReset = async () => {
    if (!settings.passwordHash) return;
    if (!confirm('重置密码不会丢失患者数据。\n下次登录时输入新密码即可。\n\n确认重置？')) return;
    setResetting(true);
    try {
      const { db } = await import('@/lib/db');
      await db.transaction('rw', db.settings, async () => {
        await db.settings.delete('passwordHash');
        await db.settings.delete('passwordSalt');
      });
      window.location.reload();
    } catch (e) {
      setError('重置失败');
    } finally { setResetting(false); }
  };

  const handleUnlock = async () => {
    if (loading) return;
    setLoading(true); setError('');
    try {
      const ok = await verifyUserPassword(password);
      if (ok) { onUnlock(); setPassword(''); }
      else { setError('密码错误，请重试'); setShaking(true); setTimeout(() => setShaking(false), 400); }
    } catch (e) {
      setError((e as Error).message || '验证失败');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleUnlock();
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[var(--color-bg)]">
      <div className="text-center px-6">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="font-ui text-2xl font-bold text-gradient mb-1">心脏外科围术期</h1>
        <h2 className="font-ui text-base text-[var(--color-text-secondary)] mb-10">患者管理系统</h2>
        <div className={`flex flex-col items-center gap-4 ${shaking ? 'animate-[shake_400ms_ease-in-out]' : ''}`}>
          <input
            type="password" value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            onKeyDown={handleKeyDown}
            placeholder="请输入解锁密码"
            className="font-ui w-64 text-center py-3 text-base"
            autoFocus inputMode="text" enterKeyHint="go"
          />
          <button onClick={handleUnlock} disabled={loading}
            className="font-ui w-64 py-3 bg-[var(--color-primary)] text-white rounded-[var(--radius)] font-semibold hover:bg-[var(--color-primary-dark)] transition-colors text-base disabled:opacity-50"
            style={{ minHeight: 48 }}>
            {loading ? '验证中...' : '解锁'}
          </button>
          {error && <p className="text-[var(--color-error)] text-sm">{error}</p>}
        </div>
        {!settings.passwordHash ? (
          <p className="mt-10 text-sm text-[var(--color-text-muted)]">首次使用，输入任意密码完成设置</p>
        ) : (
          <div className="mt-10 space-y-1">
            <p className="text-sm text-[var(--color-text-muted)]">请输入已设置的解锁密码</p>
            <button onClick={handleReset} disabled={resetting}
              className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-error)] underline transition-colors">
              {resetting ? '重置中...' : '忘记密码？'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
