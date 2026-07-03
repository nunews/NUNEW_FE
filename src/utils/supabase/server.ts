// 서버 컴포넌트에서 사용할 읽기 전용
"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieStore = Awaited<ReturnType<typeof cookies>>;

export async function createServerSupabase(cookieStore?: CookieStore) {
  const resolvedCookieStore = cookieStore ?? (await cookies());

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return resolvedCookieStore.getAll().map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }));
        },
        setAll() {},
      },
    }
  );
}
