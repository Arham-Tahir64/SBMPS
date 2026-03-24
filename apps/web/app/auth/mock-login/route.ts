import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/operations/live", request.url));
  response.cookies.set("sdmps_session", "mock-session", {
    httpOnly: true,
    sameSite: "lax",
    path: "/"
  });
  return response;
}
