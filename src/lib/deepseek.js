let _client = null;
export function createDeepSeekClient(apiKey, baseURL = 'https://api.deepseek.com') {
    _client = { apiKey, baseURL };
}
export async function testConnection(apiKey) {
    try {
        const res = await fetch('https://api.deepseek.com/v1/models', {
            headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (res.ok)
            return { success: true, message: '连接成功' };
        return { success: false, message: `连接失败: ${res.status}` };
    }
    catch (e) {
        return { success: false, message: `网络错误: ${e.message}` };
    }
}
export async function streamChatCompletion(messages, onChunk, signal, model = 'deepseek-chat') {
    if (!_client)
        throw new Error('API Key 未配置');
    const res = await fetch(`${_client.baseURL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${_client.apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages: messages.map((m) => ({ role: m.role, content: m.content })),
            stream: true,
            temperature: 0.3,
            max_tokens: 2048,
        }),
        signal,
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`API 错误 (${res.status}): ${err}`);
    }
    const reader = res.body?.getReader();
    if (!reader)
        throw new Error('无法读取响应流');
    const decoder = new TextDecoder();
    let fullText = '';
    while (true) {
        const { done, value } = await reader.read();
        if (done)
            break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter((line) => line.startsWith('data: '));
        for (const line of lines) {
            const data = line.slice(6);
            if (data === '[DONE]')
                continue;
            try {
                const json = JSON.parse(data);
                const content = json.choices?.[0]?.delta?.content;
                if (content) {
                    fullText += content;
                    onChunk(fullText);
                }
            }
            catch { /* skip parse errors */ }
        }
    }
    return fullText;
}
export function buildSystemPrompt(patientContext, knowledgeChunks) {
    const systemPrompt = `你是一位资深心脏外科ICU主治医师，负责审核和总结患者查房数据。

## 你的角色
- 根据查房数据生成专业的病情摘要和诊疗计划
- 基于循证医学知识做出临床判断
- 识别潜在风险并给出预警

## 参考知识
${knowledgeChunks.map((c, i) => `[知识${i + 1}]\n${c}`).join('\n\n')}

## 输出格式
请用中文输出，包含三个部分：

### 病情摘要
- 患者当前整体状态
- 与前次查房的对比变化（如有）
- 关键异常指标及意义

### 诊疗计划
- 药物调整建议
- 拔管/转出/出院评估
- 进一步检查和治疗建议
- 康复和营养计划

### 风险提示
- 当前阶段的常见并发症预警
- 个体化风险因素
- 需要重点监测的指标`;
    const userPrompt = `以下是患者查房数据，请生成病情摘要和诊疗计划：

${JSON.stringify(patientContext, null, 2)}`;
    return [
        { role: 'system', content: systemPrompt, timestamp: new Date().toISOString() },
        { role: 'user', content: userPrompt, timestamp: new Date().toISOString() },
    ];
}
