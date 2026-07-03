"use client";

import LoginBanner from "@/components/auth/LoginBanner";
import Header from "@/components/layout/header";
import { Bubble } from "@/components/ui/Bubble";
import { TextButton } from "@/components/ui/TextButton";
import { useMutation } from "@tanstack/react-query";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const signInWithGoogle = async () => {
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:4000";

    window.location.href = backendUrl + "/auth/google";
  };

  const { mutate: gooogleLogin, isPending } = useMutation({
    mutationFn: signInWithGoogle,
    onError: (error) => {
      console.error("구글로그인오류", error);
    },
  });

  return (
    <>
      <Header page="login" logo={false} />
      <div className="h-screen flex flex-col px-6">
        <LoginBanner />
        <div className="w-full relative flex flex-1 ">
          <div
            className="absolute
            bottom-[140px] left-1/2 -translate-x-1/2 "
          >
            <Bubble>3초만에 로그인해요</Bubble>
          </div>

          <TextButton
            onClick={() => gooogleLogin()}
            disabled={isPending}
            className="absolute bottom-[90px] h-12.5 rounded-full border-[var(--color-gray-30)] border-1 bg-[var(--color-white)] "
          >
            <div className="flex items-center justify-center gap-2">
              <FcGoogle size={20} />
              <span>구글 로그인</span>
            </div>
          </TextButton>
        </div>
      </div>
    </>
  );
}
