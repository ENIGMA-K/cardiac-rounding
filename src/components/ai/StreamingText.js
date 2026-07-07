import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function StreamingText({ text, isStreaming }) {
    if (!text && !isStreaming)
        return null;
    return (_jsxs("div", { className: "text-sm leading-relaxed whitespace-pre-wrap", children: [text.split('\n').map((line, i) => {
                if (line.startsWith('### ')) {
                    return _jsx("h4", { className: "font-ui text-base font-bold text-[var(--color-text)] mt-3 mb-1", children: line.slice(4) }, i);
                }
                if (line.startsWith('## ')) {
                    return _jsx("h3", { className: "font-ui text-lg font-bold text-[var(--color-primary-dark)] mt-4 mb-2 border-b border-[var(--color-border-light)] pb-1", children: line.slice(3) }, i);
                }
                if (line.match(/^\d+\.\s/)) {
                    return _jsx("p", { className: "ml-4 mb-0.5", children: line }, i);
                }
                if (line.trim() === '')
                    return _jsx("br", {}, i);
                return _jsx("p", { className: "mb-0.5", children: line }, i);
            }), isStreaming && (_jsx("span", { className: "inline-block w-2 h-4 bg-[var(--color-primary)] ml-0.5 animate-pulse" }))] }));
}
