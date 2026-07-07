class RAGEngine {
    chunks = [];
    ready = false;
    async init(chunks) {
        if (chunks)
            this.chunks = chunks;
        this.ready = true;
    }
    search(query, limit = 6) {
        if (!this.ready || this.chunks.length === 0)
            return [];
        // Simple keyword-based search since flexsearch Document API has complex types
        const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 1);
        const scored = this.chunks.map((chunk) => {
            let score = 0;
            const content = (chunk.content + ' ' + chunk.title + ' ' + (chunk.tags || []).join(' ')).toLowerCase();
            for (const term of terms) {
                if (content.includes(term))
                    score += 1;
                // Bonus for exact phrase match
                if (content.includes(query.toLowerCase()))
                    score += 5;
            }
            // Bonus for title match
            if (chunk.title.toLowerCase().includes(query.toLowerCase()))
                score += 3;
            return { chunk, score };
        });
        return scored
            .filter((s) => s.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map((s) => s.chunk);
    }
    buildQuery(patient, record) {
        const terms = [];
        if (patient.surgery?.surgeryType) {
            const s = patient.surgery.surgeryType;
            if (s.includes('CABG'))
                terms.push('CABG 冠状动脉旁路移植');
            if (s.includes('AVR'))
                terms.push('主动脉瓣置换 AVR');
            if (s.includes('MVR'))
                terms.push('二尖瓣置换 MVR');
            if (s.includes('Bentall'))
                terms.push('Bentall 主动脉根部');
            if (s.includes('夹层'))
                terms.push('主动脉夹层');
            terms.push(s);
        }
        const phaseMap = {
            'pre-op': '术前评估 手术准备',
            'surgery-day': '手术日 ICU入室 初始评估',
            'post-op-icu': '术后监护 ICU 拔管 血流动力学',
            'post-op-ward-monitor': '转出ICU 病房监护',
            'post-op-ward': '术后恢复 病房',
            'transfer': '转出 转科',
            'discharged': '出院',
        };
        terms.push(phaseMap[patient.phase] || patient.phase);
        if (record.detailsText) {
            const text = record.detailsText;
            if (/心动?过速/.test(text) || /心率.*\d{3}/.test(text))
                terms.push('心动过速');
            if (/心动?过缓/.test(text))
                terms.push('心动过缓');
            if (/低血压/.test(text))
                terms.push('低血压');
            if (/出血/.test(text) || /引流/.test(text))
                terms.push('术后出血');
            if (/肾/.test(text) || /Scr/.test(text))
                terms.push('急性肾损伤 AKI');
            if (/电解|血钾|血钠/.test(text))
                terms.push('电解质异常');
            if (/乳酸|Lac/.test(text))
                terms.push('高乳酸血症');
        }
        if (patient.comorbidities?.length)
            terms.push(patient.comorbidities.join(' '));
        return terms.join(' ');
    }
    get isReady() { return this.ready; }
    get chunkCount() { return this.chunks.length; }
}
export const ragEngine = new RAGEngine();
export async function loadKnowledgeBase() {
    try {
        // Try dynamic import of built-in knowledge base
        const mod = await import('@data/knowledge-base.json').catch(() => null);
        if (mod) {
            const data = mod.default || mod;
            await ragEngine.init(data.chunks || []);
            return;
        }
    }
    catch { /* not built yet */ }
    // No knowledge base available - RAG disabled
    await ragEngine.init([]);
}
