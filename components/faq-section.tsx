import { BitmapChevron } from "@/components/bitmap-chevron"

const faqs = [
  {
    question: "What is Zelo?",
    answer:
      "Zelo is an autonomy-first agent for software work. You describe intent and constraints; it plans, executes, and verifies the result.",
  },
  {
    question: "Is Zelo a chatbot?",
    answer:
      "No. Zelo is designed to take actions (plan, edit, run, verify) instead of stopping at advice. Conversation is the interface, execution is the core.",
  },
  {
    question: "What does “autonomy-first” mean?",
    answer:
      "Autonomy-first means progress is the default. Zelo runs an independent working loop (plan → act → verify → recover) and only asks for input when it truly needs it.",
  },
  {
    question: "What can it do today?",
    answer:
      "Typical workflows include code changes, refactors, debugging, generating docs, and shipping small-to-medium features end-to-end, with human oversight for intent and approvals.",
  },
  {
    question: "How do I try it?",
    answer:
      "Join the waitlist and you’ll get updates on availability, early access, and supported platforms.",
  },
]

export function FaqSection() {
  return (
    <section id="faq" className="relative py-32 pl-6 md:pl-28 pr-6 md:pr-12 border-t border-border/30">
      <div className="mb-16">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">04 / FAQ</span>
        <h2 className="mt-4 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">QUESTIONS</h2>
        <p className="mt-6 max-w-2xl font-mono text-sm text-muted-foreground leading-relaxed">
          A few quick answers about what Zelo is (and what it isn’t).
        </p>
      </div>

      <div className="mx-auto space-y-4">
        {faqs.map((item) => (
          <details
            key={item.question}
            className="group rounded-xl border border-border/40 bg-background/40 backdrop-blur-sm"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-5">
              <span className="font-mono text-xs md:text-sm uppercase tracking-widest text-foreground/90">
                {item.question}
              </span>
              <BitmapChevron className="shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-45" />
            </summary>
            <div className="px-6 pb-6">
              <p className="font-mono text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}

