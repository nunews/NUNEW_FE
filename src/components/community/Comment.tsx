"use client";
import { fetchWriter } from "@/app/api/community";
import { useQuery } from "@tanstack/react-query";
import profileImg2 from "../../assets/images/default_profile.png";
import { IconButton } from "../ui/IconButton";
import { AiOutlineMore } from "react-icons/ai";
import Image from "next/image";
import Dropdown from "../ui/Dropdown";
import { PiPencilLine } from "react-icons/pi";
import { RiDeleteBinLine } from "react-icons/ri";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";

interface CommentProps {
  commentUserId: string;
  comment: string;
  created_at: string;
  onDelete: () => void;
  onUpdate: (newContent: string) => void;
}
export default function Comment({
  commentUserId,
  comment,
  created_at,
  onDelete,
  onUpdate,
}: CommentProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const userId = useAuthStore((state) => state.userId);
  useEffect(() => {
    setMounted(true);
  }, []);

  //댓글 작성자 정보 불러오기
  const { data: commentWriterData } = useQuery({
    queryKey: ["writerDetail", commentUserId],
    queryFn: () => fetchWriter(commentUserId as string),
    enabled: !!commentUserId,
  });

  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedComment, setEditedComment] = useState(comment);

  const toggleOpen = () => {
    setOpen((prev) => !prev);
  };

  const deleteHandler = () => {
    try {
      onDelete();
      toast.success("댓글이 삭제되었습니다");
      setOpen(false);
    } catch (e) {
      console.error(e);
      console.error("삭제에 실패했습니다");
    }
  };
  const editHandler = () => {
    setIsEditing(true);
    setTimeout(() => setOpen(false), 0);
  };
  const updateHandler = () => {
    onUpdate(editedComment);
    setIsEditing(false);
  };

  return (
    <>
      {mounted && (
        <>
          <div className="mt-6 w-full h-auto flex justify-between">
            <div className="flex items-start w-full">
              <Image
                src={commentWriterData?.profile_image ?? profileImg2}
                alt="profileImg"
                width={36}
                height={36}
                className="shrink-0 rounded-full w-9 h-9 object-cover"
              />
              <div className="flex flex-col ml-3 w-[90%]">
                <div className="flex items-center gap-2">
                  <span className="text-[var(--color-gray-100)] dark:text-[var(--color-white)] text-base font-semibold">
                    {commentWriterData?.nickname}
                  </span>
                  <span className="text-[var(--color-gray-60)] text-[13px]">
                    {created_at.slice(5, 10)}
                  </span>
                </div>

                {!isEditing ? (
                  <p className="mt-1 text-[var(--color-gray-100)] dark:text-[var(--color-gray-40)] text-base">
                    {editedComment}
                  </p>
                ) : (
                  <div className="px-2 mt-1 flex items-center border border-[var(--color-gray-20)] dark:border-[var(--color-gray-60)] rounded-[10px] w-full">
                    <textarea
                      value={editedComment}
                      onChange={(e) => setEditedComment(e.target.value)}
                      className="flex-1 block resize-none items-center justify-center text-base outline-none px-1 py-1 text-[var(--color-gray-100)] dark:text-[var(--color-gray-40)]"
                    />
                    <button
                      onClick={updateHandler}
                      className="text-[var(--color-primary-50)] text-[14px] font-semibold flex items-center justify-center shrink-0"
                    >
                      <Check className="h-5 w-5 cursor-pointer" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            {!isEditing && userId === commentUserId && (
              <IconButton
                icon={AiOutlineMore}
                size={24}
                color={theme === "light" ? "#2f2f2f" : "var(--color-white)"}
                onClick={toggleOpen}
                className="w-8 h-8 hover:bg-[var(--color-gray-10)] dark:hover:bg-[var(--color-gray-100)]"
              />
            )}
          </div>
          <div className="absolute top-9 right-0">
            {userId === commentUserId && (
              <Dropdown
                isOpen={open}
                onClose={toggleOpen}
                title="내 댓글"
                items={[
                  {
                    icon: <PiPencilLine />,
                    label: "수정하기",
                    onClick: editHandler,
                  },
                  {
                    icon: <RiDeleteBinLine />,
                    label: "삭제하기",
                    onClick: deleteHandler,
                    danger: true,
                  },
                ]}
              />
            )}
          </div>
        </>
      )}
    </>
  );
}
