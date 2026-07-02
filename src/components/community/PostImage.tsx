"use client";

import { IMAGE_ALLOWED_TYPES, IMAGE_MAX_SIZE } from "@/lib/constants/files";
import createClient from "@/utils/supabase/client";
import Image from "next/image";
import { useRef } from "react";
import { SlPicture } from "react-icons/sl";
import { toast } from "sonner";

export default function PostImage({
  setContentImg,
  contentImg,
}: {
  setContentImg: (url: string) => void;
  contentImg: string | null;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const handleClick = () => {
    fileInputRef.current?.click();
  };
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 타입 지정하고 해당 타입만 가능
    if (!IMAGE_ALLOWED_TYPES.includes(file?.type)) {
      toast.error("PNG, JPG, JPEG 파일만 업로드 가능합니다.");
      e.target.value = "";
      return;
    }
    // 파일 크기 지정하고 해당 크기보다 작을 경우만 가능
    if (file?.size > IMAGE_MAX_SIZE) {
      toast.error("파일 크기는 5MB 이하만 가능합니다.");
      e.target.value = "";
      return;
    }
    const ext = file?.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${ext}`;

    const { data, error } = await supabase.storage
      .from("post-images")
      .upload(fileName, file, { upsert: true });

    if (error) {
      console.error("업로드 실패:", error.message);
      return;
    }

    // 업로드된 파일  가져오기
    const { data: urlData } = supabase.storage
      .from("post-images")
      .getPublicUrl(fileName);

    setContentImg(urlData.publicUrl);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="flex flex-col items-center justify-center mt-2 w-full h-[197px] rounded-[12px] border bg-[var(--color-gray-10)] dark:bg-[#121212] border-[var(--color-gray-30)] dark:border-[var(--color-gray-100)] hover:bg-[var(--color-gray-20)] dark:hover:bg-[var(--color-gray-100)] hover:border-[var(--color-gray-50)] dark:hover:border-[var(--color-gray-80)] transition-all duration-300 ease-in-out cursor-pointer"
      >
        {contentImg ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={contentImg}
              alt="업로드된 이미지"
              fill
              className="h-full w-auto object-contain"
            />
          </div>
        ) : (
          <>
            <SlPicture className="w-5 h-5 text-[var(--color-gray-80)]" />
            <p className="mt-[6px] text-[var(--color-gray-80)] text-sm">
              눌러서 이미지 업로드
            </p>
          </>
        )}
      </button>

      <input
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  );
}
