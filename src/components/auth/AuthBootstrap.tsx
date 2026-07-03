"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

// 최초 유저 정보 저장하는 로직
export default function AuthBootstrap() {
  const { isInitialized, setUser, clearUser } = useAuthStore();

  useEffect(() => {
    if (isInitialized) return;

    const init = async () => {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:4000";

      try {
        const response = await fetch(backendUrl + "/auth/me", {
          credentials: "include",
        });

        if (!response.ok) {
          clearUser();
          return;
        }

        const user = await response.json();

        setUser({
          userId: user.userId,
          email: user.email,
          nickname: user.nickname,
          profile_image: user.profileImage,
          age_range: user.ageRange,
          gender: user.gender,
          interest: user.interest ?? [],
        });
      } catch (error) {
        console.error("인증 초기화 실패", error);
        clearUser();
      }
    };

    init();
  }, [isInitialized, clearUser, setUser]);

  return null;
}
