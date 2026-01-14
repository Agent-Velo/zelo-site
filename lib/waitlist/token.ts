import crypto from "node:crypto"
import { z } from "zod"

const PayloadSchema = z.object({
  v: z.literal(1),
  email: z.string().email().max(254),
  utm: z
    .object({
      source: z.string().trim().min(1).max(120).optional(),
      medium: z.string().trim().min(1).max(120).optional(),
      campaign: z.string().trim().min(1).max(120).optional(),
    })
    .optional(),
  iat: z.number().int().nonnegative(),
  exp: z.number().int().nonnegative(),
})

type Payload = z.infer<typeof PayloadSchema>

function getTokenSecret(): string {
  const secret = process.env.WAITLIST_TOKEN_SECRET
  if (!secret) {
    throw new Error("WAITLIST_TOKEN_SECRET is not set")
  }
  return secret
}

function getTtlSeconds(): number {
  const raw = process.env.WAITLIST_TOKEN_TTL_SECONDS
  if (!raw) return 60 * 60 * 24 * 7
  const parsed = Number(raw)
  if (!Number.isFinite(parsed) || parsed <= 0) return 60 * 60 * 24 * 7
  return Math.floor(parsed)
}

function base64UrlEncode(input: string | Buffer): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input
  return buf
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "")
}

function base64UrlDecodeToString(input: string): string {
  const normalized = input.replaceAll("-", "+").replaceAll("_", "/")
  const padLength = (4 - (normalized.length % 4)) % 4
  const padded = normalized + "=".repeat(padLength)
  return Buffer.from(padded, "base64").toString("utf8")
}

function signPayload(payloadB64: string): string {
  const secret = getTokenSecret()
  const sig = crypto.createHmac("sha256", secret).update(payloadB64).digest()
  return base64UrlEncode(sig)
}

export async function signWaitlistToken({ email }: { email: string }): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const payload: Payload = {
    v: 1,
    email,
    utm: undefined,
    iat: now,
    exp: now + getTtlSeconds(),
  }

  const payloadB64 = base64UrlEncode(JSON.stringify(payload))
  const signature = signPayload(payloadB64)
  return `${payloadB64}.${signature}`
}

export async function signWaitlistTokenWithUtm({
  email,
  utm,
}: {
  email: string
  utm?: { source?: string; medium?: string; campaign?: string }
}): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const payload: Payload = {
    v: 1,
    email,
    utm,
    iat: now,
    exp: now + getTtlSeconds(),
  }

  const payloadB64 = base64UrlEncode(JSON.stringify(payload))
  const signature = signPayload(payloadB64)
  return `${payloadB64}.${signature}`
}

export async function verifyWaitlistToken({
  token,
}: {
  token: string
}): Promise<
  | { ok: true; email: string; utm?: { source?: string; medium?: string; campaign?: string } }
  | { ok: false; reason: string }
> {
  const [payloadB64, signature] = token.split(".")
  if (!payloadB64 || !signature) return { ok: false, reason: "FORMAT" }

  const expected = signPayload(payloadB64)
  const sigBuf = Buffer.from(signature)
  const expectedBuf = Buffer.from(expected)
  if (
    sigBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(sigBuf, expectedBuf)
  ) {
    return { ok: false, reason: "SIG" }
  }

  let parsed: z.SafeParseReturnType<unknown, Payload>
  try {
    const decoded = base64UrlDecodeToString(payloadB64)
    const json = JSON.parse(decoded)
    parsed = PayloadSchema.safeParse(json)
  } catch {
    return { ok: false, reason: "PAYLOAD" }
  }
  if (!parsed.success) return { ok: false, reason: "PAYLOAD" }

  const now = Math.floor(Date.now() / 1000)
  if (parsed.data.exp < now) return { ok: false, reason: "EXPIRED" }

  return { ok: true, email: parsed.data.email, utm: parsed.data.utm }
}

export function buildWaitlistConfirmUrl({ token }: { token: string }): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL
  if (!siteUrl) {
    throw new Error("SITE_URL (or NEXT_PUBLIC_SITE_URL) is not set")
  }
  const url = new URL("/api/waitlist/confirm", siteUrl)
  url.searchParams.set("token", token)
  return url.toString()
}
