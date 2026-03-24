import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.email("Invalid email address"),
  subject: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = parsed.data;

    await prisma.contactMessage.create({
      data: { name, email, subject, message },
    });

    return NextResponse.json({ message: "Message received." }, { status: 201 });
  } catch (err) {
    console.error("Contact error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
