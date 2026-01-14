import { z } from "zod"

const VerifyResponseSchema = z.object({
  success: z.boolean(),
  challenge_ts: z.string().optional(),
  hostname: z.string().optional(),
  credit: z.boolean().optional(),
  "error-codes": z.array(z.string()).optional(),
})

export async function verifyHCaptchaToken({
  token,
  remoteip,
}: {
  token: string
  remoteip?: string
}): Promise<boolean> {
  if (process.env.NODE_ENV !== "production" && process.env.HCAPTCHA_BYPASS === "true") {
    return true
  }

  const secret = process.env.HCAPTCHA_SECRET
  if (!secret) {
    throw new Error("HCAPTCHA_SECRET is not set")
  }

  const params = new URLSearchParams({
    secret,
    response: token,
  })
  if (remoteip) params.set("remoteip", remoteip)

  const resp = await fetch("https://hcaptcha.com/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  })

  if (!resp.ok) return false

  const json = await resp.json().catch(() => null)
  const parsed = VerifyResponseSchema.safeParse(json)
  if (!parsed.success) return false
  return parsed.data.success
}

