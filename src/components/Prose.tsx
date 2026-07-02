import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

// No "use client": study content is static, so markdown-to-HTML (including syntax
// highlighting) runs at build time and ships zero extra JS to the browser.
export function Prose({ children, slug }: { children: string; slug: string }) {
  // h2 ids match the audio manifest's section ids 1:1 (both derived by walking the
  // markdown's `##` headings in document order), so the audio drawer can scroll to
  // the section it's about to narrate.
  let sectionIndex = 0;
  return (
    <div className="prose prose-stone max-w-none break-words prose-headings:font-mono prose-headings:tracking-tight prose-h2:mt-8 prose-h2:scroll-mt-6 prose-h2:border-b prose-h2:border-line prose-h2:pb-1 prose-a:text-accent prose-code:before:content-none prose-code:after:content-none prose-pre:bg-ink prose-pre:text-paper dark:prose-invert dark:prose-pre:bg-card dark:prose-pre:text-ink">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h2: ({ children: heading, ...props }) => {
            sectionIndex += 1;
            return <h2 id={`s-${slug}-${String(sectionIndex).padStart(2, "0")}`} {...props}>{heading}</h2>;
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
