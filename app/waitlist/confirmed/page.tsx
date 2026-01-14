import Link from "next/link"

const copy: Record<string, { title: string; body: string }> = {
  ok: {
    title: "You're on the waitlist",
    body: "Email confirmed. We'll keep you posted.",
  },
  missing: {
    title: "Missing token",
    body: "This confirmation link is incomplete.",
  },
  invalid: {
    title: "Invalid link",
    body: "This confirmation link is invalid or expired.",
  },
  error: {
    title: "Something went wrong",
    body: "Please try again from the homepage.",
  },
}

export default async function WaitlistConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const status = typeof params.status === "string" ? params.status : "error"
  const email = typeof params.email === "string" ? params.email : null

  const content = copy[status] ?? copy.error

  return (
    <main className="relative min-h-screen">
      <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-lg border border-border bg-background/40 p-8 backdrop-blur">
          <h1 className="font-[var(--font-bebas)] text-4xl tracking-wide">
            {content.title}
          </h1>
          <p className="mt-4 font-mono text-sm text-muted-foreground">
            {content.body}
          </p>
          {status === "ok" && email ? (
            <p className="mt-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {email}
            </p>
          ) : null}

          <div className="mt-8 flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center border border-foreground/20 px-5 py-3 font-mono text-xs uppercase tracking-widest text-foreground hover:border-accent hover:text-accent transition-all duration-200"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

