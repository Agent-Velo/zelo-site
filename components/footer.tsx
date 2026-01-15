"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function Footer() {
  const footerRef = useRef<HTMLElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!footerRef.current) return

    const ctx = gsap.context(() => {
      // Grid fade up
      if (gridRef.current) {
        gsap.from(gridRef.current.children, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        })
      }

      // Bottom fade in
      if (bottomRef.current) {
        gsap.from(bottomRef.current, {
          y: 20,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: bottomRef.current,
            start: "top 95%",
            toggleActions: "play none none reverse",
          },
        })
      }
    }, footerRef)

    return () => ctx.revert()
  }, [])

  return (
    <footer
      ref={footerRef}
      className="relative border-t border-border/30 ml-6 md:ml-28"
    >
      {/* Main grid links */}
      <div
        ref={gridRef}
        className="grid grid-cols-2 md:grid-cols-5"
      >
        {/* Docs */}
        <a
          href="https://docs.zelo.sh"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center py-16 border-r border-b md:border-b-0 border-border/30 hover:bg-accent/5 transition-colors duration-300 group"
        >
          <span className="font-mono text-sm tracking-wider text-foreground/80 group-hover:text-accent transition-colors duration-200">
            Docs
          </span>
        </a>

      {/* Changelog */}
      <a
          href="/changelog"
          className="flex items-center justify-center py-16 border-r border-border/30 hover:bg-accent/5 transition-colors duration-300 group"
      >
      <span className="font-mono text-sm tracking-wider text-foreground/80 group-hover:text-accent transition-colors duration-200">
        Changelog
      </span>
      </a>

          {/* GitHub */}
          <a
              href="https://github.cm/zelosh/zelo"
              className="flex items-center justify-center py-16 border-r border-border/30 hover:bg-accent/5 transition-colors duration-300 group"
          >
      <span className="font-mono text-sm tracking-wider text-foreground/80 group-hover:text-accent transition-colors duration-200">
        GitHub
      </span>
          </a>

          {/* X */}
        <a
          href="https://x.com/zelodotsh"
          className="flex items-center justify-center py-16 border-r md:border-r border-b md:border-b-0 border-border/30 hover:bg-accent/5 transition-colors duration-300 group"
        >
          <span className="font-mono text-sm tracking-wider text-foreground/80 group-hover:text-accent transition-colors duration-200">
            X
          </span>
        </a>

        {/* Discord */}
        <a
          href="https://discord.gg/RnE9PgNAjb"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center py-16 border-r md:border-r border-border/30 hover:bg-accent/5 transition-colors duration-300 group"
        >
          <span className="font-mono text-sm tracking-wider text-foreground/80 group-hover:text-accent transition-colors duration-200">
            Discord
          </span>
        </a>

      </div>

      {/* Bottom links */}
      <div
        ref={bottomRef}
        className="py-12 flex items-center justify-center gap-8 text-center"
      >
        <span className="font-mono text-xs text-muted-foreground">©2026 Agent Velo</span>
          {/*
        <a
          href="/brand"
          className="font-mono text-xs text-muted-foreground hover:text-accent transition-colors duration-200"
        >
          Brand
        </a>
        <a
          href="/privacy"
          className="font-mono text-xs text-muted-foreground hover:text-accent transition-colors duration-200"
        >
          Privacy
        </a>
        <a
          href="/terms"
          className="font-mono text-xs text-muted-foreground hover:text-accent transition-colors duration-200"
        >
          Terms
        </a>
        */}
      </div>
    </footer>
  )
}
