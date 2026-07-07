import { useUIStore, type ViewName } from '@/store/uiStore';
import { usePatientStore } from '@/store/patientStore';
import { useIdleTimer } from '@/hooks/useIdleTimer';
import { useSettingsStore } from '@/store/settingsStore';
import { PatientList } from '@/components/patients/PatientList';
import { PatientForm } from '@/components/patients/PatientForm';
import { PatientDetail } from '@/components/patients/PatientDetail';
import { RoundingView } from '@/components/rounding/RoundingView';
import { SettingsPage } from '@/components/settings/SettingsPage';
import { ToastContainer } from '@/components/ui/Toast';
import { GanttOverview } from '@/components/gantt/GanttOverview';
import { CalculatorPage } from '@/components/calculators/CalculatorPage';
import { TodosPage } from '@/components/todos/TodosPage';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { Patient } from '@/types';
import type { PatientFormData } from '@/store/patientStore';

interface AppShellProps { onLock: () => void; }

const navItems: { key: ViewName; label: string; icon: string }[] = [
  { key: 'patients', label: '患者列表', icon: '👥' },
  { key: 'gantt', label: '甘特图', icon: '📊' },
  { key: 'todos', label: '待办', icon: '📋' },
  { key: 'calculators', label: '计算器', icon: '🔢' },
  { key: 'settings', label: '设置', icon: '⚙' },
];

export function AppShell({ onLock }: AppShellProps) {
  const { currentView, setView, sidebarOpen, toggleSidebar, activeModal, modalData, openModal, closeModal, addToast } = useUIStore();
  const { addPatient, updatePatient, fetchPatients, getPatient } = usePatientStore();
  const { settings } = useSettingsStore();
  const lockMins = settings.autoLockMinutes ?? 15;
  useIdleTimer(lockMins, onLock, true);

  const handlePatientSave = async (data: PatientFormData) => {
    const existing = modalData?.patient as Patient | undefined;
    if (existing) {
      await updatePatient(existing.id, data);
      addToast(`${data.name} 已更新`, 'success');
    } else {
      const p = await addPatient(data);
      addToast(`已添加患者：${p.name}`, 'success');
    }
    await fetchPatients();
    closeModal();
  };

  const renderModal = () => {
    if (!activeModal) return null;
    const data = modalData || {};

    if (activeModal === 'patientForm') {
      const patient = data.patient as Patient | undefined;
      return (
        <Modal isOpen onClose={closeModal} title={patient ? `编辑患者 — ${patient.name}` : '新增患者'} size="md">
          <PatientForm patient={patient} onSave={handlePatientSave} onCancel={closeModal} />
        </Modal>
      );
    }

    if (activeModal === 'patientDetail') {
      return (
        <Modal isOpen onClose={closeModal} size="md">
          <PatientDetail patientId={data.patientId as string} />
        </Modal>
      );
    }

    if (activeModal === 'rounding') {
      const patientId = data.patientId as string;
      const session = data.session as string | undefined;
      const recordId = data.recordId as string | undefined;
      return (
        <Modal isOpen onClose={closeModal} size="md">
          <div className="max-h-[85vh]" style={{ minHeight: '70vh' }}>
            <RoundingView patientId={patientId} session={session} recordId={recordId} />
          </div>
        </Modal>
      );
    }

    if (activeModal === 'calculator') {
      const pid = data.patientId as string;
      return (
        <Modal isOpen onClose={closeModal} size="md">
          <CalculatorPage patientId={pid} onClose={closeModal}
            onTagSave={async (tag) => {
              const p = await getPatient(pid);
              if (p && !p.tags.includes(tag)) {
                await updatePatient(pid, { tags: [...p.tags, tag] });
                addToast(`已添加标签: ${tag}`, 'success');
              }
            }} />
        </Modal>
      );
    }

    return null;
  };

  return (
    <div className="h-screen flex flex-col bg-[var(--color-bg)] overflow-hidden">
      <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] flex-shrink-0 z-40 pt-[var(--safe-area-top)]">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between h-12 px-4">
          <div className="flex items-center gap-3">
            <button onClick={toggleSidebar} className="font-ui text-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text)] md:hidden">☰</button>
            <h1 className="font-ui text-base font-bold text-[var(--color-primary-dark)]">心脏外科围术期管理</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setView('settings')}>⚙ 设置</Button>
            <Button variant="ghost" size="sm" onClick={onLock}>🔒</Button>
          </div>
        </div>
      </header>
      <div className="max-w-screen-xl mx-auto flex flex-1 min-h-0 w-full">
        {sidebarOpen && (
          <aside className="w-36 lg:w-40 flex-shrink-0 bg-[var(--color-surface)] border-r border-[var(--color-border)] hidden md:block overflow-y-auto">
            <nav className="flex flex-col p-2 gap-1">
              {navItems.map((item) => (
                <button key={item.key} onClick={() => setView(item.key)}
                  className={`font-ui flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-left ${currentView === item.key ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] font-semibold' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-border-light)]'}`}
                ><span>{item.icon}</span><span>{item.label}</span></button>
              ))}
            </nav>
          </aside>
        )}
        <main className="flex-1 p-4 overflow-y-auto" style={{ paddingBottom: 'var(--safe-area-bottom)' }}>
          {currentView === 'patients' && <PatientList />}
          {currentView === 'gantt' && <GanttOverview />}
          {currentView === 'todos' && <TodosPage />}
          {currentView === 'calculators' && <CalculatorPage />}
          {currentView === 'settings' && <SettingsPage />}
        </main>
      </div>
      {renderModal()}
      <ToastContainer />
    </div>
  );
}
