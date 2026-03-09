"use client";

import defaultProfileImg from "@/assets/images/default_profile.png";
import Image from "next/image";
import { TextButton } from "../ui/TextButton";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { categoryIdInvMap } from "@/lib/categoryUUID";
import { MyProfileSkel } from "./skeleton/MyProfileSkel";

const MyProfile = () => {
  const route = useRouter();
  const nickname = useAuthStore((state) => state.nickname);
  const profileImage = useAuthStore((state) => state.profile_image);
  const interests = useAuthStore((state) => state.interest);

  const handleEditClick = () => {
    route.push("/profile/setting");
  };

  if (!nickname && !profileImage) return <MyProfileSkel />;

  return (
    <div className='flex flex-col gap-4 items-center justify-center mx-auto pb-8'>
      <div className='relative w-[80px] h-[80px] rounded-full'>
        <Image
          src={profileImage || defaultProfileImg}
          alt='profileImg'
          fill
          sizes='80px'
          className='rounded-full object-cover'
        />
      </div>
      <div className='text-left'>
        <h1 className='font-semibold text-[#191919] dark:text-white text-lg text-center'>
          {nickname || ""}
        </h1>
        <h2 className='font-medium text-sm text-[#8f8f8f] text-center'>
          {interests && interests.length > 0
            ? interests.map((id) => categoryIdInvMap[id]).join(", ")
            : "관심 카테고리가 없습니다"}
        </h2>
      </div>
      <TextButton
        className='bg-black text-white hover:bg-(--color-gray-100)'
        onClick={handleEditClick}
      >
        내 정보 수정
      </TextButton>
    </div>
  );
};

export default MyProfile;
