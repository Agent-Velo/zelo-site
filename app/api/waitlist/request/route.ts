import { NextResponse } from "next/server"
import { z } from "zod"

import { verifyHCaptchaToken } from "@/lib/waitlist/hcaptcha"
import { buildWaitlistConfirmUrl, signWaitlistTokenWithUtm } from "@/lib/waitlist/token"
import { sendWaitlistConfirmEmail } from "@/lib/waitlist/resend"

const RequestBodySchema = z.object({
  email: z.string().trim().email().max(254),
  captchaToken: z.string().trim().min(1),
  utm: z
    .object({
      source: z.string().trim().min(1).max(120).optional(),
      medium: z.string().trim().min(1).max(120).optional(),
      campaign: z.string().trim().min(1).max(120).optional(),
    })
    .optional(),
})

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => null)
    const parsed = RequestBodySchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "INVALID_REQUEST" },
        { status: 400 }
      )
    }

    const { email, captchaToken, utm } = parsed.data

    const captchaOk = await verifyHCaptchaToken({ token: captchaToken })
    if (!captchaOk) {
      return NextResponse.json(
        { error: "CAPTCHA_FAILED" },
        { status: 400 }
      )
    }

    const token = await signWaitlistTokenWithUtm({ email, utm })
    const confirmUrl = buildWaitlistConfirmUrl({ token })

    await sendWaitlistConfirmEmail({ email, confirmUrl })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("waitlist/request error", err)
    return NextResponse.json({ error: "INTERNAL" }, { status: 500 })
  }
}
