import { createServerSupabase } from "@/utils/supabase/serverAction";
import { NextResponse, type NextRequest } from "next/server";

export const GET = async (request: NextRequest) => {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(origin + next);
    }
  }

  console.error("인증오류");
  return NextResponse.redirect(
    origin + "/auth/login?error=AuthenticationFailed"
  );
};
