"use client"

import type { FormEvent } from "react"
import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import HCaptcha from "@hcaptcha/react-hcaptcha"

import { ScrambleTextOnHover } from "@/components/scramble-text"
import { BitmapChevron } from "@/components/bitmap-chevron"
import { cn } from "@/lib/utils"

type Status = "idle" | "captcha" | "sending" | "sent" | "error"

export function WaitlistJoin({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<string | null>(null)
  const [utm, setUtm] = useState<{ source?: string; medium?: string; campaign?: string }>({})

  const inputRef = useRef<HTMLInputElement>(null)
  const captchaRef = useRef<any>(null)
  const pendingEmailRef = useRef<string | null>(null)

  const sitekey = process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const source = params.get("utm_source") ?? undefined
    const medium = params.get("utm_medium") ?? undefined
    const campaign = params.get("utm_campaign") ?? undefined
    setUtm({ source, medium, campaign })
  }, [])

  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => inputRef.current?.focus(), 0)
    return () => clearTimeout(t)
  }, [open])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  async function requestMagicLink({ captchaToken }: { captchaToken: string }) {
    const pendingEmail = pendingEmailRef.current
    if (!pendingEmail) return

    setStatus("sending")
    setError(null)

    try {
      const resp = await fetch("/api/waitlist/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail, captchaToken, utm }),
      })

      pendingEmailRef.current = null

      if (!resp.ok) {
        const json = await resp.json().catch(() => null)
        const code = typeof json?.error === "string" ? json.error : "UNKNOWN"
        setError(code)
        setStatus("error")
        return
      }

      setStatus("sent")
    } catch (err) {
      console.error("waitlist request error", err)
      setError("NETWORK")
      setStatus("error")
    } finally {
      captchaRef.current?.resetCaptcha?.()
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()

    const normalized = email.trim().toLowerCase()
    if (!normalized.includes("@") || normalized.length > 254) {
      setError("INVALID_EMAIL")
      setStatus("error")
      return
    }

    if (!sitekey) {
      setError("MISSING_HCAPTCHA_SITEKEY")
      setStatus("error")
      return
    }

    setError(null)
    setStatus("captcha")
    pendingEmailRef.current = normalized
    captchaRef.current?.execute?.()
  }

  const busy = status === "captcha" || status === "sending"
  const disabled = busy || status === "sent"

  return (
    <motion.div layout className={cn("relative", className)}>
      <AnimatePresence initial={false} mode="wait">
        {!open ? (
          <motion.button
            key="button"
            type="button"
            onClick={() => {
              setOpen(true)
              setStatus("idle")
              setError(null)
            }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="group inline-flex items-center gap-3 border border-foreground/20 px-6 py-3 font-mono text-xs uppercase tracking-widest text-foreground hover:border-accent hover:text-accent transition-all duration-200"
          >
            <ScrambleTextOnHover text="Join Waitlist" as="span" duration={0.6} />
            <BitmapChevron className="transition-transform duration-[400ms] ease-in-out group-hover:rotate-45" />
          </motion.button>
        ) : (
          <motion.form
            key="form"
            onSubmit={onSubmit}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="flex items-stretch gap-2"
          >
            <div className="flex items-center border border-foreground/20 bg-transparent px-4 py-3">
              <input
                ref={inputRef}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={disabled}
                className="w-[min(18rem,60vw)] bg-transparent font-mono text-xs tracking-widest text-foreground placeholder:text-muted-foreground/70 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={disabled}
              className={cn(
                "group inline-flex items-center gap-3 border border-foreground/20 px-5 py-3 font-mono text-xs uppercase tracking-widest text-foreground transition-all duration-200",
                disabled
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:border-accent hover:text-accent"
              )}
            >
              <ScrambleTextOnHover
                text={status === "sent" ? "Sent" : busy ? "Sending" : "Submit"}
                as="span"
                duration={0.4}
              />
              <BitmapChevron
                className={cn(
                  "transition-transform duration-[400ms] ease-in-out",
                  !disabled && "group-hover:rotate-45"
                )}
              />
            </button>

            {sitekey ? (
              <div className="sr-only" aria-hidden="true">
                <HCaptcha
                  sitekey={sitekey}
                  size="invisible"
                  ref={captchaRef}
                  onVerify={(token: string) => requestMagicLink({ captchaToken: token })}
                  onError={() => {
                    setError("CAPTCHA_ERROR")
                    setStatus("error")
                  }}
                  onExpire={() => {
                    setError("CAPTCHA_EXPIRED")
                    setStatus("error")
                  }}
                />
              </div>
            ) : null}

            <div className="absolute left-0 top-full mt-3">
              {status === "sent" ? (
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Check your email for a magic link.
                </p>
              ) : error ? (
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  {error}
                </p>
              ) : (
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Press Enter to submit. Esc to close.
                </p>
              )}
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
