import 'highlight.js/styles/github.css'

import { type ReactNode, memo } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'

interface MarkdownContentProps {
  text: string
  className?: string
}

function MarkdownContentInner({
  text,
  className = '',
}: MarkdownContentProps): ReactNode {
  return (
    <div className={`markdown-body text-[15px] leading-relaxed text-black ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
        components={{
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-black underline underline-offset-2"
            >
              {children}
            </a>
          ),
          h1: ({ children }) => (
            <h1 className="mb-3 mt-6 text-xl font-semibold first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-2 mt-5 text-lg font-semibold first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-4 text-base font-semibold first:mt-0">
              {children}
            </h3>
          ),
          ul: ({ children }) => (
            <ul className="my-3 list-disc space-y-1 pl-6">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-3 list-decimal space-y-1 pl-6">{children}</ol>
          ),
          p: ({ children }) => <p className="my-3 first:mt-0 last:mb-0">{children}</p>,
          code: ({ className, children, ...props }) => {
            const isBlock = Boolean(className?.includes('language-'))
            if (isBlock) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              )
            }
            return (
              <code
                className="px-0 font-mono text-[0.9em] text-black"
                {...props}
              >
                {children}
              </code>
            )
          },
          pre: ({ children }) => <pre className="my-4 overflow-x-auto">{children}</pre>,
          blockquote: ({ children }) => (
            <blockquote className="my-4 pl-0 text-black">
              {children}
            </blockquote>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  )
}

export const MarkdownContent = memo(MarkdownContentInner)
