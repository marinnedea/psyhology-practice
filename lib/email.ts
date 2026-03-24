import nodemailer from "nodemailer";
import { getSettings } from "@/lib/settings";
import { prisma } from "@/lib/db";

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

async function getTransporter() {
  const settings = await getSettings();

  if (settings.smtp_enabled !== "1") {
    return null;
  }

  // smtp_password is sensitive — fetch directly from DB, never cached
  const pwRow = await prisma.siteSetting.findUnique({
    where: { key: "smtp_password" },
  });
  const password = pwRow?.value ?? "";

  const port = parseInt(settings.smtp_port || "587", 10);
  const secure = settings.smtp_secure === "ssl"; // true for port 465, false for others

  return nodemailer.createTransport({
    host: settings.smtp_host,
    port,
    secure,
    auth: {
      user: settings.smtp_user,
      pass: password,
    },
    ...(settings.smtp_secure === "tls"
      ? { requireTLS: true }
      : {}),
  });
}

export async function sendEmail(payload: EmailPayload): Promise<{ ok: boolean; error?: string }> {
  try {
    const settings = await getSettings();

    if (settings.smtp_enabled !== "1") {
      return { ok: false, error: "SMTP not enabled" };
    }

    const transporter = await getTransporter();
    if (!transporter) {
      return { ok: false, error: "Could not create transporter" };
    }

    const fromName = settings.smtp_from_name || settings.site_name || "MindBridge";
    const fromEmail = settings.smtp_from_email || settings.contact_email;

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: message };
  }
}

export async function testSmtpConnection(): Promise<{ ok: boolean; error?: string }> {
  try {
    const transporter = await getTransporter();
    if (!transporter) {
      return { ok: false, error: "SMTP not enabled or misconfigured" };
    }
    await transporter.verify();
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: message };
  }
}

// --- Email templates ---

export function ticketCreatedEmail(opts: {
  ticketId: string;
  subject: string;
  userName: string;
  siteUrl: string;
}) {
  return {
    subject: `[Ticket #${opts.ticketId.slice(-6).toUpperCase()}] ${opts.subject}`,
    html: `
      <p>Hi ${opts.userName},</p>
      <p>Your support ticket has been received. Our team will get back to you as soon as possible.</p>
      <p><strong>Subject:</strong> ${opts.subject}</p>
      <p>You can view and reply to your ticket here:<br>
      <a href="${opts.siteUrl}/client/support/${opts.ticketId}">${opts.siteUrl}/client/support/${opts.ticketId}</a></p>
      <p>Thank you,<br>Support Team</p>
    `,
    text: `Hi ${opts.userName},\n\nYour support ticket has been received.\n\nSubject: ${opts.subject}\n\nView your ticket: ${opts.siteUrl}/client/support/${opts.ticketId}\n\nThank you,\nSupport Team`,
  };
}

export function ticketReplyEmail(opts: {
  ticketId: string;
  subject: string;
  userName: string;
  replierName: string;
  messagePreview: string;
  siteUrl: string;
  role: "CLIENT" | "PSYCHOLOGIST";
}) {
  const path = opts.role === "CLIENT" ? "client" : "psychologist";
  return {
    subject: `Re: [Ticket #${opts.ticketId.slice(-6).toUpperCase()}] ${opts.subject}`,
    html: `
      <p>Hi ${opts.userName},</p>
      <p><strong>${opts.replierName}</strong> has replied to your ticket.</p>
      <blockquote style="border-left:3px solid #6366f1;padding-left:12px;color:#555;">
        ${opts.messagePreview}
      </blockquote>
      <p><a href="${opts.siteUrl}/${path}/support/${opts.ticketId}">View full conversation</a></p>
      <p>Thank you,<br>Support Team</p>
    `,
    text: `Hi ${opts.userName},\n\n${opts.replierName} has replied to your ticket.\n\n${opts.messagePreview}\n\nView: ${opts.siteUrl}/${path}/support/${opts.ticketId}\n\nThank you,\nSupport Team`,
  };
}

export function ticketStatusChangedEmail(opts: {
  ticketId: string;
  subject: string;
  userName: string;
  newStatus: string;
  siteUrl: string;
  role: "CLIENT" | "PSYCHOLOGIST";
}) {
  const path = opts.role === "CLIENT" ? "client" : "psychologist";
  const statusLabel = opts.newStatus.replace("_", " ");
  return {
    subject: `[Ticket #${opts.ticketId.slice(-6).toUpperCase()}] Status updated: ${statusLabel}`,
    html: `
      <p>Hi ${opts.userName},</p>
      <p>Your ticket status has been updated to <strong>${statusLabel}</strong>.</p>
      <p><strong>Subject:</strong> ${opts.subject}</p>
      <p><a href="${opts.siteUrl}/${path}/support/${opts.ticketId}">View ticket</a></p>
      <p>Thank you,<br>Support Team</p>
    `,
    text: `Hi ${opts.userName},\n\nYour ticket status has been updated to ${statusLabel}.\n\nSubject: ${opts.subject}\n\nView: ${opts.siteUrl}/${path}/support/${opts.ticketId}\n\nThank you,\nSupport Team`,
  };
}

export function contactReplyEmail(opts: {
  toName: string;
  originalSubject: string | null;
  replyBody: string;
  fromName: string;
}) {
  const subject = opts.originalSubject
    ? `Re: ${opts.originalSubject}`
    : "Reply to your message";
  return {
    subject,
    html: `
      <p>Hi ${opts.toName},</p>
      <p>Thank you for reaching out. Here is our reply to your message:</p>
      <blockquote style="border-left:3px solid #6366f1;padding-left:12px;color:#555;margin:16px 0;">
        ${opts.replyBody.replace(/\n/g, "<br>")}
      </blockquote>
      <p>If you have any further questions, feel free to contact us again.</p>
      <p>Best regards,<br>${opts.fromName}</p>
    `,
    text: `Hi ${opts.toName},\n\nThank you for reaching out. Here is our reply:\n\n${opts.replyBody}\n\nBest regards,\n${opts.fromName}`,
  };
}
