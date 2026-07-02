"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-sm break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: ({ children }) => (
            <code className="rounded bg-line/70 px-1 py-0.5 font-mono text-[0.85em] text-ink">{children}</code>
          ),
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
