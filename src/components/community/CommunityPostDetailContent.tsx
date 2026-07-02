"use client";
import Image from "next/image";
import profileImg from "../../assets/images/default_profile.png";
import postImg from "../../assets/images/default_nunew.svg";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWriter, postDelete } from "@/app/api/community";
import { categoryIdInvMap } from "@/lib/categoryUUID";
import { IconButton } from "../ui/IconButton";
import { AiOutlineMore } from "react-icons/ai";
import { useTheme } from "next-themes";
import { useState } from "react";
import { RiDeleteBinLine } from "react-icons/ri";
import { PiPencilLine } from "react-icons/pi";
import Dropdown from "../ui/Dropdown";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface PostDetailContentProps {
  writerId: string;
  postId: string;
  categoryId: string;
  title: string;
  content_image: string;
  contents: string;
}
export default function CommunityPostDetailContent({
  writerId,
  categoryId,
  postId,
  title,
  content_image,
  contents,
}: PostDetailContentProps) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const userId = useAuthStore((state) => state.userId);
  const queryClient = useQueryClient();
  const router = useRouter();

  const toggleOpen = () => {
    setOpen((prev) => !prev);
  };

  const deleteMutation = useMutation({
    mutationFn: () => postDelete(postId, userId as string),
    onSuccess: () => {
      toast.success("게시글이 삭제되었습니다");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["communityList"] });
      router.replace("/community"); // 목록으로 이동
    },
    onError: (err) => {
      console.error("삭제 실패", err);
      toast.error("게시글 삭제에 실패했습니다");
    },
  });

  const deleteHandler = () => {
    toast(
      <div className="flex items-center">
        {/* 왼쪽 텍스트 */}
        <p className="text-sm pr-4">정말 이 게시글을 삭제하시겠습니까?</p>

        {/* 오른쪽 버튼 */}
        <div className="ml-auto flex gap-1.5 whitespace-nowrap">
          <button
            className="px-3 py-1 text-sm rounded-md bg-[var(--color-gray-10)]"
            onClick={() => toast.dismiss()}
          >
            취소
          </button>
          <button
            className="px-3 py-1 text-sm rounded-md bg-[var(--color-gray-100)] text-white"
            onClick={() => {
              toast.dismiss();
              deleteMutation.mutate();
            }}
          >
            삭제
          </button>
        </div>
      </div>,
      {
        duration: Infinity,
      }
    );
  };
  //게시글 작성자 정보 불러오기
  const { data: writerData } = useQuery({
    queryKey: ["writerDetail", writerId],
    queryFn: () => fetchWriter(writerId),
    enabled: !!writerId,
  });
  return (
    <>
      {/* 프로필+카테고리 */}
      <div className="mt-4 w-full flex items-center justify-between">
        <div className="flex items-center w-auto h-9">
          <Image
            src={writerData?.profile_image || profileImg}
            alt="profileImg"
            width={36}
            height={36}
            className="rounded-full w-9 h-9 object-cover"
          />
          <span className="ml-[10px] text-[var(--color-black)] dark:text-[var(--color-white)] text-base font-semibold">
            {writerData?.nickname}
          </span>
        </div>
        <p className="text-[var(--color-gray-100)] dark:text-[var(--color-gray-60)] text-sm">
          #{categoryIdInvMap[categoryId]}
        </p>
      </div>
      <div className="relative w-full aspect-[16/10] mt-6 rounded-[12px] overflow-hidden">
        <Image
          src={content_image ?? postImg}
          alt="postImg"
          fill
          className="rounded-[12px] object-cover"
        />
      </div>
      <div className="relative">
        <div className="flex justify-between items-center">
          <p className="mt-6 text-[var(--color-black)] dark:text-[var(--color-white)] text-[22px] font-bold">
            {title}
          </p>

          {userId === writerId && (
            <div className="relative">
              <IconButton
                icon={AiOutlineMore}
                size={24}
                color={theme === "light" ? "#2f2f2f" : "var(--color-white)"}
                onClick={toggleOpen}
                className="w-8 h-8 hover:bg-[var(--color-gray-10)] dark:hover:bg-[var(--color-gray-100)]"
              />

              {open && (
                <div className="absolute right-0 top-full mt-2 z-50">
                  <Dropdown
                    isOpen={open}
                    onClose={toggleOpen}
                    title="내 게시글"
                    items={[
                      {
                        icon: <PiPencilLine />,
                        label: "수정하기",
                        onClick: () => router.push(`/community/${postId}/edit`),
                      },
                      {
                        icon: <RiDeleteBinLine />,
                        label: "삭제하기",
                        onClick: deleteHandler,
                        danger: true,
                      },
                    ]}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <p className="mt-2 h-auto dark:text-[var(--color-gray-40)]">
          {contents}
        </p>
      </div>
    </>
  );
}
