"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Prose({ children }: { children: string }) {
  return (
    <div className="prose prose-slate max-w-none prose-h2:mt-8 prose-h2:border-b prose-h2:border-slate-200 prose-h2:pb-1 prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-code:before:content-none prose-code:after:content-none prose-a:text-blue-700 break-words">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
