import type { Metadata } from "next"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import Link from "next/link"
import { privacyContent } from "./content"

export const runtime = "edge"

export const metadata: Metadata = {
  title: "Privacy - ZELO",
  description: "Privacy Policy for the ZELO project.",
}

export default function PrivacyPage() {
  const content = privacyContent

  return (
    <main className="relative min-h-screen bg-background">
      <div className="noise-overlay" aria-hidden="true" />
      <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/30 bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-8 md:px-12">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-accent"
            >
              <span>←</span>
              <span>Back to Home</span>
            </Link>
          </div>
        </header>

        {/* Content */}
        <article className="container mx-auto px-6 py-16 md:px-12 md:py-24 max-w-4xl">
          <div className="prose prose-invert prose-slate max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight mb-8 text-foreground">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="font-[var(--font-bebas)] text-3xl md:text-4xl tracking-tight mt-12 mb-6 text-foreground border-b border-border/30 pb-3">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="font-sans text-xl md:text-2xl font-semibold mt-8 mb-4 text-foreground">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="font-sans text-base leading-relaxed mb-4 text-foreground/80">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-none space-y-2 my-6 pl-0">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-2 my-6 pl-4 font-sans text-foreground/80">
                    {children}
                  </ol>
                ),
                li: ({ children }) => {
                  const isOrderedList = typeof children === "string" || !children
                  if (isOrderedList) {
                    return <li className="font-sans text-foreground/80">{children}</li>
                  }
                  return (
                    <li className="flex items-start gap-3">
                      <span className="text-accent mt-1 flex-shrink-0">→</span>
                      <span className="font-sans text-foreground/80 flex-1">{children}</span>
                    </li>
                  )
                },
                strong: ({ children }) => <strong className="font-semibold text-accent">{children}</strong>,
                em: ({ children }) => <em className="italic text-foreground/90">{children}</em>,
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-accent hover:underline transition-colors font-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                hr: () => <hr className="border-t border-border/30 my-12" />,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-accent pl-6 my-6 italic text-foreground/70">
                    {children}
                  </blockquote>
                ),
                code: ({ children }) => (
                  <code className="font-mono text-sm bg-muted px-2 py-1 rounded text-accent">{children}</code>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </article>

        {/* Footer */}
        <footer className="border-t border-border/30 bg-background/80 backdrop-blur-sm mt-24">
          <div className="container mx-auto px-6 py-8 md:px-12">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest text-center">
              © 2026 Agent Velo. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </main>
  )
}

