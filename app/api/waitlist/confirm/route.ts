import { NextResponse } from "next/server"

import { upsertWaitlistContact } from "@/lib/waitlist/resend"
import { verifyWaitlistToken } from "@/lib/waitlist/token"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const token = url.searchParams.get("token")
    if (!token) {
      return NextResponse.redirect(new URL("/waitlist/confirmed?status=missing", url))
    }

    const verified = await verifyWaitlistToken({ token })
    if (!verified.ok) {
      return NextResponse.redirect(new URL("/waitlist/confirmed?status=invalid", url))
    }

    await upsertWaitlistContact({ email: verified.email, utm: verified.utm })

    const redirectUrl = new URL("/waitlist/confirmed?status=ok", url)
    redirectUrl.searchParams.set("email", verified.email)

    return NextResponse.redirect(redirectUrl)
  } catch (err) {
    console.error("waitlist/confirm error", err)
    const url = new URL(req.url)
    return NextResponse.redirect(new URL("/waitlist/confirmed?status=error", url))
  }
}
