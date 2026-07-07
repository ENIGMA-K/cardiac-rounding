export const PHASE_LABELS = {
    'pre-op': '术前', 'surgery-day': '手术日', 'post-op-icu': '术后监护',
    'post-op-ward-monitor': '病房监护', 'post-op-ward': '术后病房', 'transfer': '转出', 'discharged': '已出院',
};
export const SESSION_LABELS = {
    'am': '早查房', 'pm': '晚查房',
};
export const TUBE_LABELS = {
    'cvc': '中心静脉导管', 'arterial-sheath': '动脉鞘管', 'pericardial-drain': '心包引流',
    'left-chest-tube': '左胸腔引流', 'right-chest-tube': '右胸腔引流', 'arrow-catheter': '胸穿Arrow管',
    'pneumothorax-tube': '气胸管', 'ett': '气管插管', 'tracheostomy': '气切管',
    'dressing': '换药',
};
export const PHASE_TRANSITIONS = {
    'pre-op': [{ label: '今日手术', target: 'surgery-day' }],
    'surgery-day': [{ label: '转入监护室', target: 'post-op-icu' }],
    'post-op-icu': [
        { label: '转入病房监护', target: 'post-op-ward-monitor' },
        { label: '转科/转院', target: 'transfer' },
    ],
    'post-op-ward-monitor': [
        { label: '转入术后病房', target: 'post-op-ward' },
        { label: '退回监护室', target: 'post-op-icu' },
        { label: '转科/转院', target: 'transfer' },
    ],
    'post-op-ward': [
        { label: '退回病房监护', target: 'post-op-ward-monitor' },
        { label: '转科/转院', target: 'transfer' },
        { label: '出院', target: 'discharged' },
    ],
    'transfer': [
        { label: '转入术后病房', target: 'post-op-ward' },
        { label: '出院', target: 'discharged' },
    ],
    'discharged': [],
};
