import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role as string | undefined;
  const isLoggedIn = !!req.auth;

  // Protected dashboard routes
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", req.url));
    if (role !== "ADMIN") return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname.startsWith("/psychologist")) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", req.url));
    if (role !== "PSYCHOLOGIST") return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname.startsWith("/client")) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", req.url));
    if (role !== "CLIENT") return NextResponse.redirect(new URL("/", req.url));
  }

  // Role-based redirect helper
  const dashboardPath =
    role === "ADMIN"
      ? "/admin"
      : role === "PSYCHOLOGIST"
        ? "/psychologist"
        : "/client";

  // /dashboard → redirect to the right dashboard based on role
  if (pathname === "/dashboard") {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", req.url));
    return NextResponse.redirect(new URL(dashboardPath, req.url));
  }

  // Redirect logged-in users away from auth pages
  if ((pathname === "/login" || pathname === "/register") && isLoggedIn) {
    return NextResponse.redirect(new URL(dashboardPath, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/psychologist/:path*",
    "/client/:path*",
    "/dashboard",
    "/login",
    "/register",
  ],
};
