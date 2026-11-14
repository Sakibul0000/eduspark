import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface MarkdownMessageProps {
  content: string;
}

function renderInlineFormatting(text: string): React.ReactNode[] {
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return tokens.map((token, idx) => {
    if (token.startsWith('`') && token.endsWith('`') && token.length >= 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-mono text-[0.85em]"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
      return (
        <strong key={idx} className="font-semibold text-slate-900 dark:text-white">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith('*') && token.endsWith('*') && token.length >= 2) {
      return (
        <em key={idx} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    }
    return <React.Fragment key={idx}>{token}</React.Fragment>;
  });
}

const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  return (
    <div className="my-3 rounded-xl border border-slate-200 dark:border-slate-700/80 overflow-hidden bg-slate-950 text-slate-100">
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-800 bg-slate-900/90 text-xs text-slate-400">
        <span className="font-mono">{language || 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto text-xs leading-relaxed font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content }) => {
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2.5 text-sm leading-relaxed">
      {parts.map((part, pIdx) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const inner = part.slice(3, -3);
          const firstNewline = inner.indexOf('\n');
          const lang = firstNewline >= 0 ? inner.slice(0, firstNewline).trim() : '';
          const code = firstNewline >= 0 ? inner.slice(firstNewline + 1) : inner;
          return <CodeBlock key={pIdx} language={lang} code={code.trimEnd()} />;
        }

        const lines = part.split('\n');
        const elements: React.ReactNode[] = [];
        let listBuffer: { ordered: boolean; items: string[] } | null = null;
        let tableBuffer: string[][] | null = null;

        const flushList = (keyPrefix: string) => {
          if (!listBuffer) return;
          if (listBuffer.ordered) {
            elements.push(
              <ol key={`${keyPrefix}-ol`} className="list-decimal pl-5 space-y-1.5">
                {listBuffer.items.map((item, idx) => (
                  <li key={idx}>{renderInlineFormatting(item)}</li>
                ))}
              </ol>
            );
          } else {
            elements.push(
              <ul key={`${keyPrefix}-ul`} className="list-disc pl-5 space-y-1.5">
                {listBuffer.items.map((item, idx) => (
                  <li key={idx}>{renderInlineFormatting(item)}</li>
                ))}
              </ul>
            );
          }
          listBuffer = null;
        };

        const flushTable = (keyPrefix: string) => {
          if (!tableBuffer || tableBuffer.length === 0) return;
          const [headerRow, ...bodyRows] = tableBuffer;
          const cleanBody = bodyRows.filter(
            (r) => !r.every((cell) => /^:?-+:?$/.test(cell.trim()))
          );
          elements.push(
            <div key={`${keyPrefix}-tbl`} className="overflow-x-auto my-2 rounded-lg border border-slate-200 dark:border-slate-700">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 dark:bg-slate-800/80">
                  <tr>
                    {headerRow.map((cell, ci) => (
                      <th key={ci} className="px-3 py-2 font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700">
                        {renderInlineFormatting(cell.trim())}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {cleanBody.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-3 py-2 text-slate-700 dark:text-slate-300">
                          {renderInlineFormatting(cell.trim())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          tableBuffer = null;
        };

        lines.forEach((rawLine, lIdx) => {
          const line = rawLine.trim();
          const key = `${pIdx}-${lIdx}`;

          if (line.startsWith('|') && line.endsWith('|')) {
            flushList(key);
            const cells = line.slice(1, -1).split('|');
            if (!tableBuffer) tableBuffer = [];
            tableBuffer.push(cells);
            return;
          } else {
            flushTable(key);
          }

          if (!line) {
            flushList(key);
            return;
          }

          if (line.startsWith('#### ')) {
            flushList(key);
            elements.push(
              <h4 key={key} className="font-display text-sm font-semibold text-slate-900 dark:text-white pt-1">
                {renderInlineFormatting(line.slice(5))}
              </h4>
            );
            return;
          }

          if (line.startsWith('### ')) {
            flushList(key);
            elements.push(
              <h3 key={key} className="font-display text-base font-semibold text-slate-900 dark:text-white pt-1">
                {renderInlineFormatting(line.slice(4))}
              </h3>
            );
            return;
          }

          const ulMatch = line.match(/^[-*]\s+(.+)$/);
          if (ulMatch) {
            if (!listBuffer || listBuffer.ordered) {
              flushList(key);
              listBuffer = { ordered: false, items: [] };
            }
            listBuffer.items.push(ulMatch[1]);
            return;
          }

          const olMatch = line.match(/^\d+\.\s+(.+)$/);
          if (olMatch) {
            if (!listBuffer || !listBuffer.ordered) {
              flushList(key);
              listBuffer = { ordered: true, items: [] };
            }
            listBuffer.items.push(olMatch[1]);
            return;
          }

          flushList(key);
          elements.push(<p key={key}>{renderInlineFormatting(line)}</p>);
        });

        flushList(`${pIdx}-end`);
        flushTable(`${pIdx}-end`);
        return <React.Fragment key={pIdx}>{elements}</React.Fragment>;
      })}
    </div>
  );
};
