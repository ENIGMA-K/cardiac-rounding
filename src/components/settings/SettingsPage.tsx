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
    if (!newPw || newPw !== confirmPw) { addToast('两次密码不一致', 'error'); return; }
    if (settings.passwordHash) {
      const ok = await verifyUserPassword(oldPw);
      if (!ok) { addToast('原密码错误', 'error'); return; }
    }
    await setPassword(newPw);
    addToast('密码已修改', 'success');
    setOldPw(''); setNewPw(''); setConfirmPw('');
  };

  const handleLockChange = (mins: number) => { updateSetting('autoLockMinutes', mins); addToast(`自动锁定: ${mins} 分钟`, 'info'); };

  const handleExport = async () => {
    const json = await exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `cardiac-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click(); URL.revokeObjectURL(url);
    addToast('数据已导出', 'success');
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      if (confirm('导入将覆盖当前所有数据，确认？')) {
        await importAllData(text);
        addToast('数据已导入，请刷新页面', 'success');
      }
    };
    input.click();
  };

  return (
    <div className="flex flex-col gap-4 max-w-lg">
      <h2 className="font-ui text-lg font-bold text-[var(--color-text)]">设置</h2>

      <Card className="p-4">
        <h4 className="font-ui text-sm font-semibold text-[var(--color-text)] mb-2">服务器地址</h4>
        <p className="text-xs text-[var(--color-text-muted)] mb-1">IP 变化时输入新地址，点"更新"重新加载</p>
        <div className="flex gap-2">
          <input id="serverUrl" defaultValue={window.location.origin} className="font-data text-sm flex-1" />
          <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(window.location.origin); addToast('已复制', 'info'); }}>复制</Button>
          <Button size="sm" onClick={() => { const el = document.getElementById('serverUrl') as HTMLInputElement; if (el?.value) window.location.href = el.value; }}>更新</Button>
        </div>
      </Card>

      <Card className="p-4">
        <h4 className="font-ui text-sm font-semibold text-[var(--color-text)] mb-2">修改密码</h4>
        <div className="space-y-2">
          {settings.passwordHash && <input type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} placeholder="原密码" />}
          <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="新密码" />
          <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="确认新密码" />
          <Button size="sm" onClick={handleChangePassword}>修改密码</Button>
        </div>
      </Card>

      <Card className="p-4">
        <h4 className="font-ui text-sm font-semibold text-[var(--color-text)] mb-2">自动锁定</h4>
        <div className="flex gap-2">
          {[5, 10, 15, 30, 60].map((m) => (
            <Button key={m} size="sm" variant={settings.autoLockMinutes === m ? 'primary' : 'outline'} onClick={() => handleLockChange(m)}>{m} 分钟</Button>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h4 className="font-ui text-sm font-semibold text-[var(--color-text)] mb-2">数据管理</h4>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleExport}>导出 JSON 备份</Button>
          <Button size="sm" variant="outline" onClick={handleImport}>导入 JSON 备份</Button>
        </div>
      </Card>
    </div>
  );
}
