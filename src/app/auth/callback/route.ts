import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/store/supabase";

// Magic-link landing: exchange the code for a session, then go to the app.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (code) await (await supabaseServer()).auth.exchangeCodeForSession(code);
  return NextResponse.redirect(new URL("/learn", url.origin));
}
