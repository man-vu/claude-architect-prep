"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Prose({ children }: { children: string }) {
  return (
    <div className="prose prose-stone max-w-none break-words prose-headings:font-mono prose-headings:tracking-tight prose-h2:mt-8 prose-h2:border-b prose-h2:border-line prose-h2:pb-1 prose-a:text-accent prose-code:before:content-none prose-code:after:content-none prose-pre:bg-ink prose-pre:text-paper dark:prose-invert dark:prose-pre:bg-card dark:prose-pre:text-ink">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
