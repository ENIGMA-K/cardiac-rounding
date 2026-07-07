function buildBedRankMap() {
    const map = new Map();
    let rank = 0;
    const seq = [];
    for (let i = 1; i <= 18; i++) {
        seq.push(String(i));
        if (i % 3 === 0) {
            const n = i / 3;
            seq.push(`+${n}`);
            seq.push(`Z${n}`);
        }
    }
    for (let i = 19; i <= 30; i++)
        seq.push(String(i));
    seq.push('+10');
    for (let i = 31; i <= 33; i++)
        seq.push(String(i));
    seq.push('+11');
    for (let i = 34; i <= 39; i++)
        seq.push(String(i));
    for (let i = 40; i <= 43; i++)
        seq.push(String(i));
    seq.push('+14');
    seq.push('+15');
    for (let i = 44; i <= 46; i++)
        seq.push(String(i));
    seq.push('+16');
    for (const bed of seq)
        map.set(bed, rank++);
    for (let i = 1; i <= 60; i++)
        map.set(`CICU${i}`, rank++);
    for (let i = 1; i <= 30; i++)
        map.set(`NICU${i}`, rank++);
    return map;
}
const bedRankMap = buildBedRankMap();
function parseBed(bed) {
    const m = bed.match(/^([A-Za-z+]*)(\d+)$/);
    if (m)
        return { prefix: m[1].toUpperCase(), num: parseInt(m[2]) };
    return { prefix: '', num: 0 };
}
export function sortByBedNumber(patients) {
    return [...patients].sort((a, b) => {
        const ra = bedRankMap.get(a.bedNumber);
        const rb = bedRankMap.get(b.bedNumber);
        if (ra != null && rb != null)
            return ra - rb;
        if (ra != null)
            return -1;
        if (rb != null)
            return 1;
        const pa = parseBed(a.bedNumber);
        const pb = parseBed(b.bedNumber);
        const prefixOrder = (p) => { if (p === 'CICU')
            return 0; if (p === 'NICU')
            return 1; if (p === '')
            return 2; if (p === '+')
            return 3; if (p === 'Z')
            return 4; return 5; };
        const poA = prefixOrder(pa.prefix), poB = prefixOrder(pb.prefix);
        if (poA !== poB)
            return poA - poB;
        return pa.num - pb.num;
    });
}
const DC = ['#4f8ef7', '#a78bfa', '#34d399', '#fbbf24', '#f87171', '#60a5fa', '#fb923c', '#f472b6', '#818cf8', '#2dd4bf'];
export function getDoctorColor(name) { let h = 0; for (let i = 0; i < name.length; i++)
    h = ((h << 5) - h) + name.charCodeAt(i); h |= 0; return DC[Math.abs(h) % DC.length]; }
export function computePhaseDays(patient) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (patient.phase === 'discharged')
        return { label: '已出院', days: 0 };
    if (patient.phase === 'pre-op') {
        const adm = new Date(patient.admissionDate + 'T00:00:00');
        return { label: '术前', days: Math.max(0, Math.floor((today.getTime() - adm.getTime()) / 86400000)) };
    }
    if (patient.surgeryDate) {
        const surg = new Date(patient.surgeryDate + 'T00:00:00');
        const days = Math.max(0, Math.floor((today.getTime() - surg.getTime()) / 86400000));
        if (days === 0)
            return { label: '手术日', days: 0 };
        const label = patient.phase === 'transfer' ? '转出后' : '术后';
        return { label, days };
    }
    const adm = new Date(patient.admissionDate + 'T00:00:00');
    return { label: '入院后', days: Math.max(0, Math.floor((today.getTime() - adm.getTime()) / 86400000)) };
}
export function sortByPhaseProgress(patients) {
    const phaseOrder = ['post-op-ward', 'post-op-ward-monitor', 'post-op-icu', 'surgery-day', 'pre-op', 'transfer', 'discharged'];
    return [...patients].sort((a, b) => {
        const piA = phaseOrder.indexOf(a.phase), piB = phaseOrder.indexOf(b.phase);
        if (piA !== piB)
            return piA - piB;
        return computePhaseDays(b).days - computePhaseDays(a).days;
    });
}
