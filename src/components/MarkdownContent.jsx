// Renders AI-generated Markdown profile text with styled headings, bullets, and bold.
import ReactMarkdown from "react-markdown";

export default function MarkdownContent({ children, className = "" }) {
  return (
    <div className={`prose-invert prose-sm max-w-none text-slate-300 ${className}`}>
      <ReactMarkdown
        components={{
          h2: ({ children: c }) => (
            <h2 className="mb-1.5 mt-4 first:mt-0 text-[13px] font-bold tracking-wide text-slate-100 uppercase">
              {c}
            </h2>
          ),
          h3: ({ children: c }) => (
            <h3 className="mb-1 mt-3 text-[12px] font-bold text-slate-200">{c}</h3>
          ),
          p: ({ children: c }) => (
            <p className="mb-2 text-[12px] leading-relaxed text-slate-300">{c}</p>
          ),
          ul: ({ children: c }) => (
            <ul className="mb-2 space-y-1 pl-4">{c}</ul>
          ),
          ol: ({ children: c }) => (
            <ol className="mb-2 list-decimal space-y-1 pl-4">{c}</ol>
          ),
          li: ({ children: c }) => (
            <li className="text-[12px] leading-relaxed text-slate-300 marker:text-violet-400">
              {c}
            </li>
          ),
          strong: ({ children: c }) => (
            <strong className="font-semibold text-slate-100">{c}</strong>
          ),
          em: ({ children: c }) => (
            <em className="text-slate-400">{c}</em>
          ),
          hr: () => (
            <hr className="my-3 border-white/[0.06]" />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
