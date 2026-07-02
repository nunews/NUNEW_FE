"use client";
import Image from "next/image";
import defaultImg from "../../assets/images/default_nunew.svg";
import profile1 from "../../assets/images/default_profile.png";
import { AiFillLike, AiOutlineLike } from "react-icons/ai";
import { IoChatboxOutline, IoEyeOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchLike,
  fetchWriter,
  isLikedByUser,
  postLike,
  postUnlike,
} from "@/app/api/community";
import { categoryIdInvMap } from "@/lib/categoryUUID";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";

interface CommunityPostProps {
  postId: string;
  postImage: string;
  writerId: string;
  categoryId: string;
  title: string;
  content: string;
  views: number;
  comments?: number;
}
export default function CommunityPost({
  postId,
  postImage,
  writerId,
  categoryId,
  title,
  content,
  views,
  comments,
}: CommunityPostProps) {
  const router = useRouter();
  const [likeCount, setLikeCount] = useState<number>(0);
  const userId = useAuthStore((state) => state.userId);

  const { data: likeData } = useQuery<number>({
    queryKey: ["likeData", postId],
    queryFn: () => {
      return fetchLike(postId);
    },
  });

  useEffect(() => {
    if (likeData !== undefined) {
      setLikeCount(likeData);
    }
  }, [likeData]);

  //작성자 정보
  const { data: writerData } = useQuery({
    queryKey: ["writer", writerId],
    queryFn: () => {
      return fetchWriter(writerId);
    },
    staleTime: 1000 * 60 * 3,
  });

  //사용자 좋아요 여부
  const { data: isLiked } = useQuery({
    queryKey: ["isLiked", userId, postId],
    queryFn: () => {
      if (!userId) {
        throw new Error("로그인이 필요합니다");
      }
      return isLikedByUser(postId, userId);
    },
  });
  const [like, setLike] = useState(isLiked ?? false); //사용자 좋아요 여부

  useEffect(() => {
    (async () => {
      const liked = await isLikedByUser(postId, userId as string);
      setLike(liked);
    })();
  }, [postId, userId]);
  const queryClient = useQueryClient();

  //좋아요 업데이트
  const { mutate: likeUpdate } = useMutation({
    mutationFn: (liked: boolean) => {
      if (!userId) {
        throw new Error("로그인이 필요합니다");
      }
      return liked ? postLike(postId, userId) : postUnlike(postId, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["likes", postId, userId] });
    },
    onError: (err) => {
      console.error("좋아요 업로드 실패:", err);
      setLike((prev) => !prev);
      setLikeCount((prev) => prev + (like ? 1 : -1));
    },
  });

  const likeHandler = () => {
    if (!userId) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    setLike((prev) => !prev);
    setLikeCount((prev) => prev + (like ? -1 : 1));
    likeUpdate(!like);
  };

  const viewHandler = () => {
    router.push(`/community/${postId}`);
  };
  return (
    <>
      <div className="group py-6 w-full h-auto border-b border-[#ebebeb] dark:border-[var(--color-gray-100)]">
        <div className="cursor-pointer" onClick={viewHandler}>
          <div className="relative w-full aspect-[16/9] rounded-[12px] overflow-hidden">
            <Image
              src={postImage ?? defaultImg}
              alt="postImage"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 rounded-[12px] bg-[var(--color-black)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="mt-4 w-full flex justify-between">
            <div className="w-auto h-9 flex items-center cursor-pointer">
              <Image
                src={writerData?.profile_image ?? profile1}
                alt="profile1"
                width={36}
                height={36}
                className="rounded-full w-9 h-9 object-cover"
              />
              <p className="ml-2 text-[var(--color-gray-100)] dark:text-[var(--color-white)] text-base font-semibold">
                {writerData?.nickname}
              </p>
            </div>
            <p className="text-[var(--color-gray-100)] flex items-center dark:text-[var(--color-gray-70)] text-sm">
              #{categoryIdInvMap[categoryId]}
            </p>
          </div>

          <p className="mt-4 text-[#191919] text-lg font-bold line-clamp-1 dark:text-[var(--color-white)] ">
            {title}
          </p>
          <p className="text-[#191919] dark:text-[var(--color-gray-40)]  group-hover:text-[var(--color-gray-90)] dark:group-hover:text-[var(--color-gray-50)] text-sm line-clamp-2 duration-300">
            {content}
          </p>
        </div>
        <div className="mt-4 flex items-center">
          {!like && (
            <AiOutlineLike
              onClick={likeHandler}
              className="w-5 h-5 cursor-pointer text-[var(--color-gray-60)] hover:text-[var(--color-black)] dark:hover:text-[var(--color-white)] duration-300"
            />
          )}
          {like && (
            <AiFillLike
              onClick={likeHandler}
              className="w-5 h-5 cursor-pointer text-[var(--color-black)] dark:text-[var(--color-white)]"
            />
          )}
          <p className="ml-[3px] text-[var(--color-gray-70)] text-[13px]">
            {likeCount}
          </p>

          <IoChatboxOutline className="ml-[11px] w-5 h-5 text-[var(--color-gray-60)]" />
          <p className="ml-[3px] text-[var(--color-gray-70)] text-[13px]">
            {comments ?? 0}
          </p>

          <IoEyeOutline className="ml-[11px] w-5 h-5 text-[var(--color-gray-60)]" />
          <p className="ml-[3px] text-[var(--color-gray-70)] text-[13px]">
            {views ?? 0}
          </p>
        </div>
      </div>
    </>
  );
}
