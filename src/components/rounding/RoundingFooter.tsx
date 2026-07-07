import { useRoundingStore } from '@/store/roundingStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/Button';

interface RoundingFooterProps { onClose: () => void; }

export function RoundingFooter({ onClose }: RoundingFooterProps) {
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

  if (!currentRecord) return null;

  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={handleSaveDraft}>保存草稿</Button>
        <Button size="sm" onClick={handleComplete}>完成查房</Button>
        <Button variant="outline" size="sm" onClick={() => openSubModal('calculator', { patientId: currentRecord.patientId })}>🔢 计算器</Button>
      </div>
      <Button variant="ghost" size="sm" onClick={onClose}>关闭</Button>
    </div>
  );
}
