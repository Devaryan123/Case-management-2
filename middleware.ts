import { NextResponse } from "next/server";
import { stackServerApp } from "./stack";

const publicRoutes = ["/signin", "/handler/signup"];
const protectedRoutes = ["/", "/dashboard"];

export async function middleware(req: any) {
  const user = await stackServerApp.getUser();
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL("/handler/signin", req.nextUrl));
  }

  if (isPublicRoute && user) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/signin", "/signup", "/", "/Timeline"],
};