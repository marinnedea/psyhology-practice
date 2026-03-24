import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import { testSmtpConnection } from "@/lib/email";

// POST /api/admin/smtp-test — verify SMTP connection
export async function POST() {
  await requireRole("ADMIN");
  const result = await testSmtpConnection();
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
