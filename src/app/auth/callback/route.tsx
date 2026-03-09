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
      // 사용자 정보 가져오기
      const { data: userData } = await supabase.auth.getUser();

      if (userData?.user) {
        // User 테이블에서 프로필 정보 확인
        const { data: profile } = await supabase
          .from("User")
          .select("nickname")
          .eq("user_id", userData.user.id)
          .single();

        // nickname이 없으면 최초 로그인 -> profile/init으로 이동
        if (!profile?.nickname) {
          return NextResponse.redirect(`${origin}/profile/init`);
        }
      }

      // 기존 사용자는 홈으로
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  console.error("인증오류");
  return NextResponse.redirect(
    `${origin}/auth/login?error=AuthenticationFailed`
  );
};
