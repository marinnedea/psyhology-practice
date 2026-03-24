import type { NextAuthConfig } from "next-auth";

// Edge-compatible auth config — no Node.js-only imports (no Prisma, no bcrypt)
// Used by middleware. The full auth.ts extends this with the Credentials provider.
export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [], // providers are added in auth.ts
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = (user.id as string) ?? "";
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
