import { useState, useCallback, useRef } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { createDeepSeekClient, streamChatCompletion, buildSystemPrompt } from '@/lib/deepseek';
import { ragEngine } from '@/lib/rag';
export function useDeepSeek() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [streamedText, setStreamedText] = useState('');
    const [error, setError] = useState(null);
    const abortRef = useRef(null);
    const { getDecryptedApiKey, settings } = useSettingsStore();
    const abort = useCallback(() => {
        abortRef.current?.abort();
        setIsGenerating(false);
    }, []);
    const generateSummary = useCallback(async (patient, record) => {
        const apiKey = getDecryptedApiKey();
        if (!apiKey)
            throw new Error('请先在设置中配置 DeepSeek API Key');
        createDeepSeekClient(apiKey, settings.apiUrl || 'https://api.deepseek.com');
        setIsGenerating(true);
        setStreamedText('');
        setError(null);
        const controller = new AbortController();
        abortRef.current = controller;
        try {
            // RAG search
            const query = ragEngine.buildQuery(patient, record);
            const chunks = ragEngine.search(query, 5);
            const knowledgeTexts = chunks.map((c) => c.content);
            if (knowledgeTexts.length === 0) {
                knowledgeTexts.push('（未找到相关参考知识，基于通用心脏外科知识回答）');
            }
            // Build context
            const patientContext = {
                患者: {
                    姓名: patient.name,
                    性别: patient.gender === 'male' ? '男' : '女',
                    年龄: patient.age,
                    诊断: patient.diagnosis,
                    手术: patient.surgery?.surgeryType || '未记录',
                    阶段: patient.phase,
                    入院日期: patient.admissionDate,
                    手术日期: patient.surgeryDate,
                },
                查房时段: record.session,
                查房记录: record.detailsText || '',
            };
            const messages = buildSystemPrompt(patientContext, knowledgeTexts);
            const fullText = await streamChatCompletion(messages, (text) => setStreamedText(text), controller.signal, settings.modelName || 'deepseek-chat');
            setIsGenerating(false);
            return fullText;
        }
        catch (err) {
            if (err.name === 'AbortError') {
                setError('已取消生成');
            }
            else {
                setError(err.message);
            }
            setIsGenerating(false);
            throw err;
        }
    }, [getDecryptedApiKey, settings]);
    return { generateSummary, isGenerating, streamedText, error, abort };
}
