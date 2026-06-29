"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { categoryIdInvMap, categoryIdMap } from "@/lib/categoryUUID";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:4000";

const toInterestTitle = (categoryId: string) => {
  const title = categoryIdInvMap[categoryId];
  return title === "그 외" ? "기타" : title;
};

const toCategoryId = (title: string) => {
  const categoryTitle = title === "기타" ? "그 외" : title;
  return categoryIdMap[categoryTitle as keyof typeof categoryIdMap];
};

export function useProfileEdit() {
  const router = useRouter();
  const {
    userId,
    email,
    nickname: currentNickname,
    profile_image: currentProfileImage,
    age_range: currentAgeRange,
    gender: currentGender,
    interest,
    setUser,
  } = useAuthStore();

  const [nickname, setNickname] = useState(currentNickname ?? "");
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    interest.map(toInterestTitle).filter(Boolean)
  );

  const [newProfileImage, setNewProfileImage] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setNickname(currentNickname ?? "");
    setSelectedInterests(interest.map(toInterestTitle).filter(Boolean));
    setIsNicknameChecked(false);
  }, [currentNickname, interest]);

  const handleSave = async () => {
    if (!userId) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    const isNicknameChanged = nickname !== currentNickname;

    if (isNicknameChanged) {
      if (!nickname.trim()) {
        toast.error("유효한 닉네임을 입력해 주세요.");
        return;
      }
      if (!isNicknameChecked) {
        toast.error("닉네임 중복 확인을 해주세요.");
        return;
      }
    }

    const categoryIds = selectedInterests.map(toCategoryId).filter(Boolean);

    if (categoryIds.length !== selectedInterests.length) {
      toast.error("저장할 수 없는 관심사가 포함되어 있어요.");
      return;
    }

    try {
      setIsSaving(true);

      if (newProfileImage) {
        const formData = new FormData();
        formData.append("file", newProfileImage);

        const imageResponse = await fetch(
          backendUrl + "/users/me/profile-image",
          {
            method: "PATCH",
            credentials: "include",
            body: formData,
          }
        );

        if (imageResponse.status === 401) {
          toast.error("로그인을 먼저해 주세요.");
          router.replace("/auth/login");
          return;
        }

        if (!imageResponse.ok) {
          toast.error("프로필 이미지 저장 중 오류가 발생했어요.");
          return;
        }
      }

      if (isNicknameChanged || !newProfileImage) {
        const profileResponse = await fetch(backendUrl + "/users/me", {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nickname,
          }),
        });

        if (profileResponse.status === 401) {
          toast.error("로그인을 먼저해 주세요.");
          router.replace("/auth/login");
          return;
        }

        if (!profileResponse.ok) {
          toast.error("프로필 저장 중 오류가 발생했어요.");
          return;
        }
      }

      const interestsResponse = await fetch(backendUrl + "/users/me/interests", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categoryIds,
        }),
      });

      if (!interestsResponse.ok) {
        toast.error("관심사 저장 중 오류가 발생했어요.");
        return;
      }

      const user = await interestsResponse.json();

      setUser({
        userId: user.userId,
        email: user.email ?? email,
        nickname: user.nickname,
        profile_image: user.profileImage,
        age_range: user.ageRange ?? currentAgeRange,
        gender: user.gender ?? currentGender,
        interest: user.interest ?? [],
      });

      toast.success("저장되었습니다!");

      router.push("/mypage");
    } catch (err) {
      console.error("저장 중 오류", err);
      toast.error("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    nickname,
    setNickname,
    currentNickname,

    selectedInterests,
    setSelectedInterests,

    currentProfileImage,
    setProfileImage: setNewProfileImage,

    isNicknameChecked,
    setIsNicknameChecked,

    handleSave,
    isSaving,
  };
}
