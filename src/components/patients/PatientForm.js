import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { v4 as uid } from 'uuid';
import { TUBE_LABELS } from '@/types';
import { Button } from '@/components/ui/Button';
const phaseOptions = [
    { value: 'pre-op', label: '术前' }, { value: 'surgery-day', label: '手术日' },
    { value: 'post-op-icu', label: '术后监护' }, { value: 'post-op-ward-monitor', label: '病房监护' },
    { value: 'post-op-ward', label: '术后病房' }, { value: 'transfer', label: '转出' },
];
export function PatientForm({ patient, onSave, onCancel }) {
    const [name, setName] = useState(patient?.name || '');
    const [gender, setGender] = useState(patient?.gender || 'male');
    const [age, setAge] = useState(patient?.age?.toString() || '');
    const [mrn, setMrn] = useState(patient?.mrn || '');
    const [bedNumber, setBedNumber] = useState(patient?.bedNumber || '');
    const [diagnosis, setDiagnosis] = useState(patient?.diagnosis || '');
    const [admissionDate, setAdmissionDate] = useState(patient?.admissionDate || new Date().toISOString().split('T')[0]);
    const [surgeryDate, setSurgeryDate] = useState(patient?.surgeryDate || '');
    const [phase, setPhase] = useState(patient?.phase || 'pre-op');
    const [attendingDoctor, setAttendingDoctor] = useState(patient?.attendingDoctor || '');
    const [comorbidities, setComorbidities] = useState(patient?.comorbidities?.join(', ') || '');
    const [tags, setTags] = useState(patient?.tags?.join(', ') || '');
    const [notes, setNotes] = useState(patient?.notes || '');
    const [showSurgery, setShowSurgery] = useState(!!patient?.surgery);
    const [surgeryType, setSurgeryType] = useState(patient?.surgery?.surgeryType || '');
    const [surgeryDetail, setSurgeryDetail] = useState(patient?.surgery?.surgeryDetail || '');
    const [cathDate, setCathDate] = useState(patient?.surgery?.cathDate || '');
    const [cathFindings, setCathFindings] = useState(patient?.surgery?.cathFindings || '');
    const [cathApproach, setCathApproach] = useState(patient?.surgery?.cathApproach || '');
    const [ctffrLad, setCtffrLad] = useState(patient?.surgery?.ctffr?.lad?.toString() || '');
    const [ctffrLcx, setCtffrLcx] = useState(patient?.surgery?.ctffr?.lcx?.toString() || '');
    const [ctffrRca, setCtffrRca] = useState(patient?.surgery?.ctffr?.rca?.toString() || '');
    const [cpbTime, setCpbTime] = useState(patient?.surgery?.cpbTime?.toString() || '');
    const [crossClampTime, setCrossClampTime] = useState(patient?.surgery?.crossClampTime?.toString() || '');
    const [cmrLge, setCmrLge] = useState(patient?.surgery?.cmrLgeSegments?.toString() || '');
    const [intraopComplications, setIntraopComplications] = useState(patient?.surgery?.intraopComplications || '');
    const [tubes, setTubes] = useState(patient?.tubes || []);
    const [newTubeType, setNewTubeType] = useState('');
    const [newTubeDate, setNewTubeDate] = useState(new Date().toISOString().split('T')[0]);
    const [errors, setErrors] = useState({});
    const addTube = () => {
        if (!newTubeType)
            return;
        setTubes([...tubes, { id: uid(), type: newTubeType, insertedAt: newTubeDate + 'T00:00:00' }]);
        setNewTubeType('');
        setNewTubeDate(new Date().toISOString().split('T')[0]);
    };
    const removeTube = (id) => setTubes(tubes.filter(t => t.id !== id));
    const labelClass = "block font-ui text-xs text-[var(--color-text-secondary)] mb-0.5";
    const inputClass = "font-ui w-full";
    const buildSurgery = () => {
        if (!showSurgery || !surgeryType.trim())
            return undefined;
        const ctffr = {};
        if (ctffrLad)
            ctffr.lad = parseFloat(ctffrLad);
        if (ctffrLcx)
            ctffr.lcx = parseFloat(ctffrLcx);
        if (ctffrRca)
            ctffr.rca = parseFloat(ctffrRca);
        return {
            surgeryType: surgeryType.trim(), surgeryDetail: surgeryDetail.trim() || undefined,
            cathDate: cathDate || undefined, cathFindings: cathFindings.trim() || undefined,
            cathApproach: cathApproach || undefined,
            ctffr: Object.keys(ctffr).length > 0 ? ctffr : undefined,
            cpbTime: cpbTime ? parseInt(cpbTime) : undefined, crossClampTime: crossClampTime ? parseInt(crossClampTime) : undefined,
            cmrLgeSegments: cmrLge ? parseInt(cmrLge) : undefined,
            intraopComplications: intraopComplications.trim() || undefined,
        };
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = {};
        if (!name.trim())
            errs.name = '必填';
        if (!age || isNaN(parseInt(age)))
            errs.age = '请输入有效年龄';
        if (!bedNumber.trim())
            errs.bedNumber = '必填';
        setErrors(errs);
        if (Object.keys(errs).length > 0)
            return;
        onSave({
            name: name.trim(), gender, age: parseInt(age), mrn: mrn.trim(), bedNumber: bedNumber.trim(),
            diagnosis: diagnosis.trim(), comorbidities: comorbidities.split(',').map((s) => s.trim()).filter(Boolean),
            admissionDate, surgeryDate: surgeryDate || undefined, phase, attendingDoctor: attendingDoctor.trim(),
            surgery: buildSurgery(), tubes, phaseHistory: patient?.phaseHistory || [{ phase, date: admissionDate }], tags: tags.split(',').map((s) => s.trim()).filter(Boolean), notes: notes.trim(),
        });
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col gap-3 max-h-[65vh] overflow-y-auto pr-1", children: [_jsxs("div", { className: "grid grid-cols-4 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: labelClass, children: "\u59D3\u540D *" }), _jsx("input", { value: name, onChange: (e) => setName(e.target.value), className: inputClass, style: { borderColor: errors.name ? 'var(--color-error)' : '' } })] }), _jsxs("div", { children: [_jsx("label", { className: labelClass, children: "\u6027\u522B" }), _jsxs("select", { value: gender, onChange: (e) => setGender(e.target.value), className: inputClass, children: [_jsx("option", { value: "male", children: "\u7537" }), _jsx("option", { value: "female", children: "\u5973" })] })] }), _jsxs("div", { children: [_jsx("label", { className: labelClass, children: "\u5E74\u9F84 *" }), _jsx("input", { type: "number", value: age, onChange: (e) => setAge(e.target.value), className: `font-data ${inputClass}`, style: { borderColor: errors.age ? 'var(--color-error)' : '' } })] }), _jsxs("div", { children: [_jsx("label", { className: labelClass, children: "\u5E8A\u53F7 *" }), _jsx("input", { value: bedNumber, onChange: (e) => setBedNumber(e.target.value), className: `font-data ${inputClass}`, style: { borderColor: errors.bedNumber ? 'var(--color-error)' : '' } })] })] }), _jsxs("div", { className: "grid grid-cols-4 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: labelClass, children: "\u75C5\u5386\u53F7" }), _jsx("input", { value: mrn, onChange: (e) => setMrn(e.target.value), className: `font-data ${inputClass}` })] }), _jsxs("div", { children: [_jsx("label", { className: labelClass, children: "\u5165\u9662\u65E5\u671F" }), _jsx("input", { type: "date", value: admissionDate, onChange: (e) => setAdmissionDate(e.target.value), className: inputClass })] }), _jsxs("div", { className: "relative", children: [_jsx("label", { className: labelClass, children: "\u624B\u672F\u65E5\u671F" }), _jsx("input", { type: "date", value: surgeryDate, onChange: (e) => setSurgeryDate(e.target.value), className: `${inputClass} pr-6` }), surgeryDate && _jsx("button", { type: "button", onClick: () => setSurgeryDate(''), className: "absolute right-2 top-[26px] text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-sm", children: "\u2715" })] }), _jsxs("div", { children: [_jsx("label", { className: labelClass, children: "\u4E34\u5E8A\u9636\u6BB5" }), _jsx("select", { value: phase, onChange: (e) => setPhase(e.target.value), className: inputClass, children: phaseOptions.map((p) => _jsx("option", { value: p.value, children: p.label }, p.value)) })] })] }), _jsxs("div", { children: [_jsx("label", { className: labelClass, children: "\u4E3B\u8981\u8BCA\u65AD" }), _jsx("textarea", { value: diagnosis, onChange: (e) => setDiagnosis(e.target.value), rows: 2, className: inputClass })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: labelClass, children: "\u4E3B\u7BA1\u533B\u751F" }), _jsx("input", { value: attendingDoctor, onChange: (e) => setAttendingDoctor(e.target.value), className: inputClass })] }), _jsxs("div", { children: [_jsx("label", { className: labelClass, children: "\u5408\u5E76\u75C7" }), _jsx("input", { value: comorbidities, onChange: (e) => setComorbidities(e.target.value), placeholder: "\u9017\u53F7\u5206\u9694", className: inputClass })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: labelClass, children: "\u6807\u7B7E" }), _jsx("input", { value: tags, onChange: (e) => setTags(e.target.value), placeholder: "\u9017\u53F7\u5206\u9694, \u5982: CABG, \u7CD6\u5C3F\u75C5", className: inputClass })] }), _jsxs("div", { children: [_jsx("label", { className: labelClass, children: "\u5907\u6CE8" }), _jsx("input", { value: notes, onChange: (e) => setNotes(e.target.value), className: inputClass })] })] }), _jsxs("div", { className: "border-t border-[var(--color-border)] pt-3", children: [_jsx("h4", { className: "font-ui text-sm font-semibold text-[var(--color-text)] mb-2", children: "\u624B\u672F\u4FE1\u606F\uFF08\u975E\u5FC5\u586B\uFF09" }), _jsxs("label", { className: "font-ui flex items-center gap-2 cursor-pointer text-sm text-[var(--color-text-secondary)]", children: [_jsx("input", { type: "checkbox", checked: showSurgery, onChange: (e) => setShowSurgery(e.target.checked), className: "w-4 h-4" }), "\u586B\u5199\u624B\u672F\u8BE6\u60C5\uFF08\u9020\u5F71\u3001\u672F\u5F0F\u3001CTFFR\u3001CPB\u53C2\u6570\u7B49\uFF09"] })] }), showSurgery && (_jsxs("div", { className: "border border-[var(--color-border)] rounded-md p-3 grid grid-cols-2 gap-3 bg-[var(--color-bg)]", children: [_jsxs("div", { className: "col-span-2", children: [_jsx("label", { className: labelClass, children: "\u624B\u672F\u65B9\u5F0F" }), _jsx("input", { value: surgeryType, onChange: (e) => setSurgeryType(e.target.value), placeholder: "\u5982: CABG\u00D74, AVR, Bentall\u624B\u672F", className: inputClass })] }), _jsxs("div", { className: "col-span-2", children: [_jsx("label", { className: labelClass, children: "\u624B\u672F\u8BE6\u60C5" }), _jsx("input", { value: surgeryDetail, onChange: (e) => setSurgeryDetail(e.target.value), placeholder: "\u6865\u8840\u7BA1\u914D\u7F6E\u7B49", className: inputClass })] }), _jsxs("div", { children: [_jsx("label", { className: labelClass, children: "\u9020\u5F71\u65E5\u671F" }), _jsx("input", { type: "date", value: cathDate, onChange: (e) => setCathDate(e.target.value), className: inputClass })] }), _jsxs("div", { children: [_jsx("label", { className: labelClass, children: "\u9020\u5F71\u5165\u8DEF" }), _jsxs("select", { value: cathApproach, onChange: (e) => setCathApproach(e.target.value), className: inputClass, children: [_jsx("option", { value: "", children: "--" }), _jsx("option", { value: "radial", children: "\u6861\u52A8\u8109" }), _jsx("option", { value: "femoral", children: "\u80A1\u52A8\u8109" })] })] }), _jsxs("div", { className: "col-span-2", children: [_jsx("label", { className: labelClass, children: "\u9020\u5F71\u7ED3\u679C" }), _jsx("textarea", { value: cathFindings, onChange: (e) => setCathFindings(e.target.value), rows: 1, className: inputClass })] }), _jsxs("div", { className: "col-span-2", children: [_jsx("label", { className: labelClass, children: "CT-FFR" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("div", { className: "flex-1", children: _jsx("input", { type: "number", step: "0.01", value: ctffrLad, onChange: (e) => setCtffrLad(e.target.value), placeholder: "LAD", className: "font-data w-full" }) }), _jsx("div", { className: "flex-1", children: _jsx("input", { type: "number", step: "0.01", value: ctffrLcx, onChange: (e) => setCtffrLcx(e.target.value), placeholder: "LCX", className: "font-data w-full" }) }), _jsx("div", { className: "flex-1", children: _jsx("input", { type: "number", step: "0.01", value: ctffrRca, onChange: (e) => setCtffrRca(e.target.value), placeholder: "RCA", className: "font-data w-full" }) })] })] }), _jsxs("div", { children: [_jsx("label", { className: labelClass, children: "CPB\u65F6\u95F4 (min)" }), _jsx("input", { type: "number", value: cpbTime, onChange: (e) => setCpbTime(e.target.value), className: "font-data w-full" })] }), _jsxs("div", { children: [_jsx("label", { className: labelClass, children: "\u963B\u65AD\u65F6\u95F4 (min)" }), _jsx("input", { type: "number", value: crossClampTime, onChange: (e) => setCrossClampTime(e.target.value), className: "font-data w-full" })] }), _jsxs("div", { children: [_jsx("label", { className: labelClass, children: "CMR LGE\u8282\u6BB5\u6570" }), _jsx("input", { type: "number", value: cmrLge, onChange: (e) => setCmrLge(e.target.value), className: "font-data w-full" })] }), _jsxs("div", { className: "col-span-2", children: [_jsx("label", { className: labelClass, children: "\u672F\u4E2D\u5E76\u53D1\u75C7" }), _jsx("textarea", { value: intraopComplications, onChange: (e) => setIntraopComplications(e.target.value), rows: 1, className: inputClass })] })] })), _jsxs("div", { className: "border-t border-[var(--color-border)] pt-3", children: [_jsx("h4", { className: "font-ui text-sm font-semibold text-[var(--color-text)] mb-2", children: "\u7BA1\u8DEF\u7BA1\u7406\uFF08\u5BFC\u7BA1/\u5F15\u6D41\u7BA1\uFF09" }), tubes.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-1.5 mb-2", children: tubes.map((tube) => (_jsxs("span", { className: "font-ui inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text-secondary)]", children: [TUBE_LABELS[tube.type], _jsx("span", { className: "text-[var(--color-text-muted)]", children: tube.insertedAt.slice(0, 10) }), _jsx("button", { type: "button", onClick: () => removeTube(tube.id), className: "text-[var(--color-error)] hover:text-[var(--color-text)] ml-0.5", children: "\u00D7" })] }, tube.id))) })), _jsxs("div", { className: "flex gap-2 items-end", children: [_jsxs("div", { className: "w-48", children: [_jsx("label", { className: labelClass, children: "\u5BFC\u7BA1\u7C7B\u578B" }), _jsxs("select", { value: newTubeType, onChange: (e) => setNewTubeType(e.target.value), className: inputClass, children: [_jsx("option", { value: "", children: "--\u9009\u62E9--" }), Object.entries(TUBE_LABELS).map(([key, label]) => (_jsx("option", { value: key, children: label }, key)))] })] }), _jsxs("div", { className: "w-36", children: [_jsx("label", { className: labelClass, children: "\u7F6E\u5165\u65E5\u671F" }), _jsx("input", { type: "date", value: newTubeDate, onChange: (e) => setNewTubeDate(e.target.value), className: inputClass })] }), _jsx(Button, { type: "button", variant: "outline", size: "sm", onClick: addTube, children: "+ \u6DFB\u52A0" })] })] }), _jsxs("div", { className: "flex justify-end gap-2 pt-2 border-t border-[var(--color-border)]", children: [_jsx(Button, { variant: "ghost", type: "button", onClick: onCancel, children: "\u53D6\u6D88" }), _jsx(Button, { type: "submit", children: patient ? '保存修改' : '添加患者' })] })] }));
}
