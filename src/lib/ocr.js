import { createWorker } from 'tesseract.js';
const LAB_PATTERNS = [
    { regex: /(?:血红蛋白|Hb|HGB)\s*[:：]?\s*(\d+\.?\d*)\s*(?:g\/L|g\/l)?/i, name: 'Hb', unit: 'g/L', category: '血常规' },
    { regex: /(?:白细胞|WBC)\s*[:：]?\s*(\d+\.?\d*)\s*(?:×10[⁹9]\/L|\/L)?/i, name: 'WBC', unit: '×10⁹/L', category: '血常规' },
    { regex: /(?:血小板|PLT)\s*[:：]?\s*(\d+\.?\d*)\s*(?:×10[⁹9]\/L|\/L)?/i, name: 'PLT', unit: '×10⁹/L', category: '血常规' },
    { regex: /(?:红细胞压积|HCT)\s*[:：]?\s*(\d+\.?\d*)\s*%?/i, name: 'HCT', unit: '%', category: '血常规' },
    { regex: /(?:肌酐|Scr|Cr|CREA)\s*[:：]?\s*(\d+\.?\d*)\s*(?:μmol\/L|umol\/L|mg\/dL)?/i, name: 'Scr', unit: 'μmol/L', category: '生化' },
    { regex: /(?:钾|K[⁺+]?)\s*[:：]?\s*(\d+\.?\d*)\s*(?:mmol\/L|mEq\/L)?/i, name: 'K⁺', unit: 'mmol/L', category: '电解质' },
    { regex: /(?:钠|Na[⁺+]?)\s*[:：]?\s*(\d+\.?\d*)\s*(?:mmol\/L)?/i, name: 'Na⁺', unit: 'mmol/L', category: '电解质' },
    { regex: /(?:钙|Ca[²2][⁺+]?)\s*[:：]?\s*(\d+\.?\d*)\s*(?:mmol\/L)?/i, name: 'Ca²⁺', unit: 'mmol/L', category: '电解质' },
    { regex: /(?:镁|Mg[²2][⁺+]?)\s*[:：]?\s*(\d+\.?\d*)\s*(?:mmol\/L)?/i, name: 'Mg²⁺', unit: 'mmol/L', category: '电解质' },
    { regex: /(?:血糖|Glc|GLU)\s*[:：]?\s*(\d+\.?\d*)\s*(?:mmol\/L|mg\/dL)?/i, name: 'Glc', unit: 'mmol/L', category: '生化' },
    { regex: /(?:PT|凝血酶原时间)\s*[:：]?\s*(\d+\.?\d*)\s*(?:秒|s)?/i, name: 'PT', unit: 's', category: '凝血' },
    { regex: /(?:INR)\s*[:：]?\s*(\d+\.?\d*)/i, name: 'INR', unit: '', category: '凝血' },
    { regex: /(?:APTT|PTT)\s*[:：]?\s*(\d+\.?\d*)\s*(?:秒|s)?/i, name: 'PTT', unit: 's', category: '凝血' },
    { regex: /(?:pH|PH)\s*[:：]?\s*(\d+\.?\d*)/i, name: 'pH', unit: '', category: '血气' },
    { regex: /(?:PaO[₂2]|PO2)\s*[:：]?\s*(\d+\.?\d*)\s*(?:mmHg)?/i, name: 'PaO₂', unit: 'mmHg', category: '血气' },
    { regex: /(?:PaCO[₂2]|PCO2)\s*[:：]?\s*(\d+\.?\d*)\s*(?:mmHg)?/i, name: 'PaCO₂', unit: 'mmHg', category: '血气' },
    { regex: /(?:乳酸|Lac|LACT)\s*[:：]?\s*(\d+\.?\d*)\s*(?:mmol\/L)?/i, name: 'Lac', unit: 'mmol/L', category: '血气' },
    { regex: /(?:HCO[₃3][⁻-]?)\s*[:：]?\s*(\d+\.?\d*)\s*(?:mmol\/L)?/i, name: 'HCO₃⁻', unit: 'mmol/L', category: '血气' },
    { regex: /(?:降钙素原|PCT)\s*[:：]?\s*(\d+\.?\d*)\s*(?:ng\/mL)?/i, name: 'PCT', unit: 'ng/mL', category: '感染' },
    { regex: /(?:C反应蛋白|CRP)\s*[:：]?\s*(\d+\.?\d*)\s*(?:mg\/L|mg\/dL)?/i, name: 'CRP', unit: 'mg/L', category: '感染' },
];
export async function runOCR(imageFile) {
    const worker = await createWorker('chi_sim+eng');
    const url = URL.createObjectURL(imageFile);
    try {
        const { data } = await worker.recognize(url);
        const text = data.text;
        const items = [];
        for (const p of LAB_PATTERNS) {
            const m = text.match(p.regex);
            if (m) {
                const v = parseFloat(m[1]);
                if (!isNaN(v) && v > 0)
                    items.push({ name: p.name, value: v, unit: p.unit, confidence: data.confidence / 100, category: p.category });
            }
        }
        return { text, items };
    }
    finally {
        URL.revokeObjectURL(url);
        await worker.terminate();
    }
}
