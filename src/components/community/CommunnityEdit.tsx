"use client";
import { useEffect, useState } from "react";
import SelectComponent from "@/components/ui/SelectComponent";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { TextButton } from "@/components/ui/TextButton";
import { useTheme } from "next-themes";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { categoryOptions } from "@/lib/constants/categoryOption";
import { categoryIdMap } from "@/lib/categoryUUID";
import PostImage from "@/components/community/PostImage";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchPostById, postUpdate } from "@/app/api/community";
import CommunityPostDetailSkel from "./Skeleton/CommunityPostDetailSkel";
import { useAuthStore } from "@/stores/authStore";

type CategoryKey = keyof typeof categoryIdMap;

export default function CommunnityEdit() {
  const { postId } = useParams<{ postId?: string }>();
  const [mounted, setMounted] = useState(false);
  const [select, setSelect] = useState<CategoryKey>("정치");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [contentImg, setContentImg] = useState<string | null>(null);
  const router = useRouter();
  const { theme } = useTheme();
  const userId = useAuthStore((state) => state.userId);
  const isCategoryKey = (v: string): v is CategoryKey => v in categoryIdMap;

  const { data: postData, isLoading } = useQuery({
    queryKey: ["postDetail", postId],
    queryFn: () => fetchPostById(postId as string),
    enabled: !!postId,
  });

  useEffect(() => {
    if (!postData) return;

    setTitle(postData.title);
    setContent(postData.contents);
    setContentImg(postData.content_image);
    setSelect(
      Object.keys(categoryIdMap).find(
        (key) => categoryIdMap[key as CategoryKey] === postData.category_id
      ) as CategoryKey
    );
  }, [postData]);

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      postUpdate(
        postId as string,
        userId as string,
        categoryIdMap[select],
        title,
        content,
        contentImg
      ),
    onSuccess: () => {
      toast.success("수정이 완료되었습니다!");
      router.push(`/community/${postId}`);
    },
    onError: (error) => {
      console.error("수정에 실패했습니다.", error);
    },
  });

  useEffect(() => setMounted(true), []);
  return (
    <>
      {mounted && (
        <>
          <div className="pt-[62px] min-h-screen w-full pb-[90px] px-5">
            {isLoading ? (
              <CommunityPostDetailSkel />
            ) : (
              <>
                <SelectComponent
                  options={categoryOptions}
                  placeholder="카테고리를 선택해 주세요"
                  onChange={(value) => {
                    if (isCategoryKey(value)) setSelect(value);
                  }}
                  defaultValue={select}
                  label="카테고리 선택"
                  className="cursor-pointer dark:text-[var(--color-gray-40)]"
                />

                <p className="mt-5 text-[var(--color-gray-80)] dark:text-[var(--color-gray-60)] text-[13px]">
                  제목
                </p>
                <Input
                  className="mt-2 w-full h-[50px] rounded-[12px] text-[var(--color-gray-100)] dark:placeholder:text-[var(--color-gray-60)] dark:hover:border-[var(--color-gray-80)] focus:border-[var(--color-gray-50)] dark:focus:border-[var(--color-gray-80)] transition-all duration-300 ease-in-out text-sm"
                  placeholder="제목을 입력해 주세요"
                  value={title}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length > 100) {
                      toast.error("제목은 최대 100자까지 입력할 수 있습니다.");
                      return;
                    }
                    setTitle(value);
                  }}
                />

                <p className="mt-5 text-[var(--color-gray-80)] text-[13px] dark:text-[var(--color-gray-60)]">
                  대표 이미지
                </p>

                <PostImage
                  setContentImg={setContentImg}
                  contentImg={contentImg}
                />

                <p className="mt-5 text-[var(--color-gray-80)] text-[13px] dark:text-[var(--color-gray-60)]">
                  내용 작성
                </p>
                <Textarea
                  className="mt-2 w-full min-h-[137px] rounded-[12px] dark:text-[var(--color-gray-50)] focus:outline-none text-[var(--color-gray-100)] hover:border-[var(--color-gray-50)] dark:border-[var(--color-gray-100)] dark:hover:border-[var(--color-gray-80)] focus:border-[var(--color-gray-50)] dark:focus:border-[var(--color-gray-80)] transition-all duration-300 ease-in-out text-sm"
                  value={content}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length > 500) {
                      toast.error("내용은 최대 500자까지 입력할 수 있습니다.");
                      return;
                    }
                    setContent(value);
                  }}
                />
              </>
            )}
          </div>

          <div className="max-w-screen-lg mx-auto fixed bottom-0 left-0 right-0 px-5 w-full h-[90px] flex items-center justify-center gap-[10px] bg-[var(--color-white)] dark:bg-[var(--color-black)]">
            <TextButton
              state={theme === "dark" ? "active" : "default"}
              className="rounded-full h-[50px] dark:bg-[var(--color-gray-100)] dark:hover:bg-[var(--color-gray-90)]"
              onClick={() => router.back()}
            >
              취소
            </TextButton>
            <TextButton
              state={theme === "dark" ? "default" : "active"}
              className="rounded-full h-[50px] dark:hover:bg-[var(--color-gray-20)]"
              onClick={() => mutate()}
              disabled={isPending}
            >
              수정 완료
            </TextButton>
          </div>
        </>
      )}
    </>
  );
}
