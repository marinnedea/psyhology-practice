import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./db";
import { authConfig } from "./auth.config";

async function verifyRecaptcha(token: string, secretKey: string): Promise<boolean> {
  try {
    const params = new URLSearchParams({
      secret: secretKey,
      response: token,
    });
    const res = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?${params.toString()}`,
      { method: "POST" }
    );
    if (!res.ok) return false;
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        recaptchaToken: { label: "reCAPTCHA Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // reCAPTCHA check — only when the secret key is configured in DB
        const secretRow = await prisma.siteSetting.findUnique({
          where: { key: "recaptcha_secret_key" },
        });
        const secretKey = secretRow?.value ?? "";

        if (secretKey) {
          const token = (credentials.recaptchaToken as string | undefined) ?? "";
          if (!token) {
            throw new Error("reCAPTCHA verification failed");
          }
          const passed = await verifyRecaptcha(token, secretKey);
          if (!passed) {
            throw new Error("reCAPTCHA verification failed");
          }
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) return null;

        const isValid = await compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
});
