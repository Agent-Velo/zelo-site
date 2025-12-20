"use client"

import { useRef, useEffect } from "react"
import { HighlightText } from "@/components/highlight-text"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function PhilosophiesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const philosophiesRef = useRef<HTMLDivElement>(null)

  const philosophies = [
    {
      number: "01",
      titleParts: [
        { text: "AUTONOMY ", highlight: true },
        { text: " AT FIRST", highlight: false },
      ],
      description: "Agents that decide and act by default, not tools that wait for instructions.",
      align: "left",
    },
    {
      number: "02",
      titleParts: [
        { text: "MONO ", highlight: true },
        { text: " IS MORE", highlight: false },
      ],
      description: "One coherent tool, not a constellation of loosely connected utilities.",
      align: "right",
    },
    {
      number: "03",
      titleParts: [
        { text: "INDEPENDENT ", highlight: false },
        { text: " WORKING", highlight: true },
      ],
      description: "The agent that can make progress alone, not ones that stall without supervision.",
      align: "left",
    },
    {
      number: "04",
      titleParts: [
        { text: "PROGRESS ", highlight: false },
        { text: " NOT PREFECT", highlight: true },
      ],
      description: "Finish what can be finished, then refine - completion over correctness.",
      align: "right",
    },
  ]

  useEffect(() => {
    if (!sectionRef.current || !headerRef.current || !philosophiesRef.current) return

    const ctx = gsap.context(() => {
      // Header slide in
      gsap.from(headerRef.current, {
        x: -60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: headerRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      })

      // Each slides in from its aligned side
      const articles = philosophiesRef.current?.querySelectorAll("article")
      articles?.forEach((article, index) => {
        const isRight = philosophies[index].align === "right"
        gsap.from(article, {
          x: isRight ? 80 : -80,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: article,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="philosophies" className="relative py-32 pl-6 md:pl-28 pr-6 md:pr-12">
      {/* Section header */}
      <div ref={headerRef} className="mb-24">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">03 / Philosophies</span>
        <h2 className="mt-4 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">WAY WE THINK</h2>
      </div>

      {/* Staggered philosophies */}
      <div ref={philosophiesRef} className="space-y-24 md:space-y-32">
        {philosophies.map((philosophy, index) => (
          <article
            key={index}
            className={`flex flex-col ${
              philosophy.align === "right" ? "items-end text-right" : "items-start text-left"
            }`}
          >
            {/* Annotation label */}
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-4">
              {philosophy.number} / {philosophy.titleParts[0].text.split(" ")[0]}
            </span>

            <h3 className="font-[var(--font-bebas)] text-4xl md:text-6xl lg:text-8xl tracking-tight leading-none">
              {philosophy.titleParts.map((part, i) =>
                part.highlight ? (
                  <HighlightText key={i} parallaxSpeed={0.6}>
                    {part.text}
                  </HighlightText>
                ) : (
                  <span key={i}>{part.text}</span>
                ),
              )}
            </h3>

            {/* Description */}
            <p className="mt-6 max-w-md font-mono text-sm text-muted-foreground leading-relaxed">
              {philosophy.description}
            </p>

            {/* Decorative line */}
            <div className={`mt-8 h-[1px] bg-border w-24 md:w-48 ${philosophy.align === "right" ? "mr-0" : "ml-0"}`} />
          </article>
        ))}
      </div>
    </section>
  )
}
