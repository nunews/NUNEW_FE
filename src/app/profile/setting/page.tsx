"use client";

import Header from "@/components/layout/header";
import { InterestList } from "@/components/mypage/InteresetList";
import ProfileEditForm from "@/components/mypage/ProfileEditForm";
import { TextButton } from "@/components/ui/TextButton";
import { useProfileEdit } from "@/hooks/useProfileEdit";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";

const ProfileSettingPage = () => {
  const clearUser = useAuthStore((state) => state.clearUser);
  const router = useRouter();

  const {
    nickname,
    setNickname,
    currentNickname,
    selectedInterests,
    setSelectedInterests,
    currentProfileImage,
    setProfileImage,
    isNicknameChecked,
    setIsNicknameChecked,
    handleSave,
  } = useProfileEdit();

  const handleLogout = () => {
    clearUser();
    router.push("/");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header logo={false} />
      <main className="flex-grow px-5 pt-18 pb-23">
        <ProfileEditForm
          nickname={nickname}
          setNickname={setNickname}
          currentNickname={currentNickname ?? ""}
          currentProfileImage={currentProfileImage}
          setProfileImage={setProfileImage}
          isNicknameChecked={isNicknameChecked}
          setIsNicknameChecked={setIsNicknameChecked}
        />
        <InterestList
          selectedInterests={selectedInterests}
          setSelectedInterests={setSelectedInterests}
        />
        <div className="flex justify-center items-center mt-20">
          <TextButton
            onClick={handleLogout}
            className="bg-transparent hover:bg-transparent w-fit text-[var(--color-gray-70)] hover:text-[var(--color-gray-80)] dark:text-[var(--color-gray-70)]"
          >
            로그아웃
          </TextButton>
        </div>
      </main>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-white)]/85 backdrop-blur-[28px] dark:bg-[#121212]/85">
        <div className="mx-auto max-w-screen-lg flex gap-2.5 p-5">
          <TextButton className="py-4 rounded-full flex-1 dark:bg-[var(--color-gray-100)] dark:hover:bg-[var(--color-gray-90)] dark:text-[var(--color-white)] text-[var(--color-black)]">
            취소하기
          </TextButton>
          <TextButton
            onClick={handleSave}
            className="py-4 rounded-full flex-1 text-[var(--color-white)] bg-[var(--color-black)] hover:bg-[var(--color-gray-100)] hover:text-[var(--color-white)]  dark:bg-[var(--color-gray-10)] dark:hover:bg-[var(--color-gray-30)] dark:text-[var(--color-gray-100)] dark:hover:text-[var(--color-gray-100)]"
          >
            변경사항 저장
          </TextButton>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingPage;
