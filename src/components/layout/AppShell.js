import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useUIStore } from '@/store/uiStore';
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
const navItems = [
    { key: 'patients', label: '患者列表', icon: '👥' },
    { key: 'gantt', label: '甘特图', icon: '📊' },
    { key: 'todos', label: '待办', icon: '📋' },
    { key: 'calculators', label: '计算器', icon: '🔢' },
    { key: 'settings', label: '设置', icon: '⚙' },
];
export function AppShell({ onLock }) {
    const { currentView, setView, sidebarOpen, toggleSidebar, activeModal, modalData, openModal, closeModal, addToast } = useUIStore();
    const { addPatient, updatePatient, fetchPatients, getPatient } = usePatientStore();
    const { settings } = useSettingsStore();
    const lockMins = settings.autoLockMinutes ?? 15;
    useIdleTimer(lockMins, onLock, true);
    const handlePatientSave = async (data) => {
        const existing = modalData?.patient;
        if (existing) {
            await updatePatient(existing.id, data);
            addToast(`${data.name} 已更新`, 'success');
        }
        else {
            const p = await addPatient(data);
            addToast(`已添加患者：${p.name}`, 'success');
        }
        await fetchPatients();
        closeModal();
    };
    const renderModal = () => {
        if (!activeModal)
            return null;
        const data = modalData || {};
        if (activeModal === 'patientForm') {
            const patient = data.patient;
            return (_jsx(Modal, { isOpen: true, onClose: closeModal, title: patient ? `编辑患者 — ${patient.name}` : '新增患者', size: "md", children: _jsx(PatientForm, { patient: patient, onSave: handlePatientSave, onCancel: closeModal }) }));
        }
        if (activeModal === 'patientDetail') {
            return (_jsx(Modal, { isOpen: true, onClose: closeModal, size: "md", children: _jsx(PatientDetail, { patientId: data.patientId }) }));
        }
        if (activeModal === 'rounding') {
            const patientId = data.patientId;
            const session = data.session;
            const recordId = data.recordId;
            return (_jsx(Modal, { isOpen: true, onClose: closeModal, size: "md", children: _jsx("div", { className: "max-h-[85vh]", style: { minHeight: '70vh' }, children: _jsx(RoundingView, { patientId: patientId, session: session, recordId: recordId }) }) }));
        }
        if (activeModal === 'calculator') {
            const pid = data.patientId;
            return (_jsx(Modal, { isOpen: true, onClose: closeModal, size: "md", children: _jsx(CalculatorPage, { patientId: pid, onClose: closeModal, onTagSave: async (tag) => {
                        const p = await getPatient(pid);
                        if (p && !p.tags.includes(tag)) {
                            await updatePatient(pid, { tags: [...p.tags, tag] });
                            addToast(`已添加标签: ${tag}`, 'success');
                        }
                    } }) }));
        }
        return null;
    };
    return (_jsxs("div", { className: "h-screen flex flex-col bg-[var(--color-bg)] overflow-hidden", children: [_jsx("header", { className: "bg-[var(--color-surface)] border-b border-[var(--color-border)] flex-shrink-0 z-40 pt-[var(--safe-area-top)]", children: _jsxs("div", { className: "max-w-screen-xl mx-auto flex items-center justify-between h-12 px-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { onClick: toggleSidebar, className: "font-ui text-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text)] md:hidden", children: "\u2630" }), _jsx("h1", { className: "font-ui text-base font-bold text-[var(--color-primary-dark)]", children: "\u5FC3\u810F\u5916\u79D1\u56F4\u672F\u671F\u7BA1\u7406" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => setView('settings'), children: "\u2699 \u8BBE\u7F6E" }), _jsx(Button, { variant: "ghost", size: "sm", onClick: onLock, children: "\uD83D\uDD12" })] })] }) }), _jsxs("div", { className: "max-w-screen-xl mx-auto flex flex-1 min-h-0 w-full", children: [sidebarOpen && (_jsx("aside", { className: "w-36 lg:w-40 flex-shrink-0 bg-[var(--color-surface)] border-r border-[var(--color-border)] hidden md:block overflow-y-auto", children: _jsx("nav", { className: "flex flex-col p-2 gap-1", children: navItems.map((item) => (_jsxs("button", { onClick: () => setView(item.key), className: `font-ui flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-left ${currentView === item.key ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] font-semibold' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-border-light)]'}`, children: [_jsx("span", { children: item.icon }), _jsx("span", { children: item.label })] }, item.key))) }) })), _jsxs("main", { className: "flex-1 p-4 overflow-y-auto", style: { paddingBottom: 'var(--safe-area-bottom)' }, children: [currentView === 'patients' && _jsx(PatientList, {}), currentView === 'gantt' && _jsx(GanttOverview, {}), currentView === 'todos' && _jsx(TodosPage, {}), currentView === 'calculators' && _jsx(CalculatorPage, {}), currentView === 'settings' && _jsx(SettingsPage, {})] })] }), renderModal(), _jsx(ToastContainer, {})] }));
}
