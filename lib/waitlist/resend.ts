import { Resend } from "resend"

function formatResendError(error: { name?: string; statusCode?: number | null; message?: string }) {
  const code = error.name ? `${error.name}` : "unknown"
  const status = typeof error.statusCode === "number" ? ` (${error.statusCode})` : ""
  const msg = error.message ?? "unknown"
  return `${code}${status}: ${msg}`
}

function getResend() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error("RESEND_API_KEY is not set")
  return new Resend(apiKey)
}

function getFromAddress(): string {
  const from = process.env.RESEND_FROM
  if (!from) throw new Error("RESEND_FROM is not set")
  return from
}

export async function sendWaitlistConfirmEmail({
  email,
  confirmUrl,
}: {
  email: string
  confirmUrl: string
}) {
  const resend = getResend()
  const from = getFromAddress()

  const subject = "Confirm your email to join the ZELO waitlist"
  const html = `
    <div style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; line-height: 1.6; color: #0b0b0e;">
      <h2 style="margin: 0 0 16px;">Confirm your email</h2>
      <p style="margin: 0 0 16px;">Click the button below to confirm your email and join the ZELO waitlist.</p>
      <p style="margin: 0 0 20px;">
        <a href="${confirmUrl}" style="display: inline-block; padding: 10px 14px; border: 1px solid #0b0b0e; text-decoration: none; color: #0b0b0e;">Confirm email</a>
      </p>
      <p style="margin: 0 0 16px; font-size: 12px; color: #4b5563;">Or copy and paste this link:</p>
      <p style="margin: 0 0 24px; font-size: 12px; word-break: break-all;">${confirmUrl}</p>
      <p style="margin: 0; font-size: 12px; color: #6b7280;">If you didn't request this, you can ignore this email.</p>
    </div>
  `.trim()

  const text = `Confirm your email to join the ZELO waitlist:\n\n${confirmUrl}\n\nIf you didn't request this, ignore this email.`

  const { data, error } = await resend.emails.send({
    from,
    to: [email],
    subject,
    html,
    text,
  })

  if (error) {
    throw new Error(`Resend send error: ${formatResendError(error)}`)
  }

  return data
}

export async function upsertWaitlistContact({
  email,
  utm,
}: {
  email: string
  utm?: { source?: string; medium?: string; campaign?: string }
}) {
  const resend = getResend()

  const segmentId = process.env.RESEND_WAITLIST_SEGMENT_ID
  const properties: Record<string, string> = {}
  if (utm?.source) properties.source = utm.source
  if (utm?.medium) properties.medium = utm.medium
  if (utm?.campaign) properties.campaign = utm.campaign

  const existing = await resend.contacts.get(email)

  if (existing.error) {
    if (existing.error.name !== "not_found") {
      throw new Error(`Resend contact get error: ${formatResendError(existing.error)}`)
    }

    const created = await resend.contacts.create({
      email,
      properties: Object.keys(properties).length ? properties : undefined,
    })

    if (created.error) {
      throw new Error(`Resend contact create error: ${formatResendError(created.error)}`)
    }

    const contact = created.data

    if (segmentId) {
      const added = await resend.contacts.segments.add({
        email,
        segmentId,
      })

      if (added.error) {
        const msg = added.error.message?.toLowerCase() ?? ""
        const seemsDuplicate =
          added.error.name === "validation_error" &&
          (msg.includes("already") || msg.includes("exists") || msg.includes("in this segment"))

        if (!seemsDuplicate) {
          throw new Error(`Resend segment add error: ${formatResendError(added.error)}`)
        }
      }
    }

    return contact
  }

  const updated = await resend.contacts.update({
    email,
    properties: Object.keys(properties).length ? properties : undefined,
    unsubscribed: false,
  })

  if (updated.error) {
    throw new Error(`Resend contact update error: ${formatResendError(updated.error)}`)
  }

  const contact = updated.data

  if (segmentId) {
    const added = await resend.contacts.segments.add({
      email,
      segmentId,
    })

    if (added.error) {
      const msg = added.error.message?.toLowerCase() ?? ""
      const seemsDuplicate =
        added.error.name === "validation_error" &&
        (msg.includes("already") || msg.includes("exists") || msg.includes("in this segment"))

      if (!seemsDuplicate) {
        throw new Error(`Resend segment add error: ${formatResendError(added.error)}`)
      }
    }
  }

  return contact
}
