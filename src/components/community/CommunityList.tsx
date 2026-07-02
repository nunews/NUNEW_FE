"use client";
import Image from "next/image";
import defaultImg from "@/assets/images/default_profile.png";
import { useEffect, useRef, useState } from "react";
import CommunityPost from "./CommunityPost";
import { Plus } from "lucide-react";
import Dropdown from "../ui/Dropdown";
import { PiPencilSimple } from "react-icons/pi";
import { VscListSelection } from "react-icons/vsc";
import { IconButton } from "../ui/IconButton";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchPost } from "@/app/api/community";
import TabMenu from "../ui/TabMenu";
import { useSortStore } from "@/stores/communitySortStore";
import { useTheme } from "next-themes";
import CommunityProfileSkel from "./Skeleton/CommunityProfileSkel";
import CommunityPostSkel from "./Skeleton/CommunityPostSkel";
import { categoryGroupMap, categoryIdInvMap } from "@/lib/categoryUUID";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";

export default function CommunityList() {
  const [selected, setSelected] = useState("all");
  const [add, setAdd] = useState(false);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const color = !mounted
    ? "var(--color-black)"
    : add
    ? "var(--color-black)"
    : theme === "light"
    ? "#bff207"
    : "var(--color-black)";
  const { sortOption, setSortOption } = useSortStore();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const userId = useAuthStore((state) => state.userId);
  const interest = useAuthStore((state) => state.interest);
  const nickname = useAuthStore((state) => state.nickname);
  const profile_image = useAuthStore((state) => state.profile_image);
  const goToCreate = () => {
    setAdd(false);
    router.push("/community/postCreate");
  };
  const goToMypage = () => {
    if (!userId) {
      toast.error("로그인이 필요합니다.");
    }
    router.push("/mypage");
  };
  useEffect(() => setMounted(true), []);

  //게시글 정보
  const { data: postData, isLoading: isPostLoading } = useQuery<Post[]>({
    queryKey: ["communityList", sortOption, selected],
    queryFn: () => fetchPost(),
    staleTime: 1000 * 60 * 3,
  });

  const filteredPosts = () => {
    if (!postData) return [];

    let filtered = postData.filter((post) => {
      if (selected === "all") return true;

      const selectedKo = categoryGroupMap.find(
        (item) => item.id === selected
      )?.label;
      return selectedKo?.includes(categoryIdInvMap[post.category_id]);
    });

    if (sortOption === "최신순") {
      filtered = filtered.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else {
      filtered = filtered.sort((a, b) => b.like_count - a.like_count);
    }
    return filtered;
  };

  return (
    <>
      <div className="min-h-screen w-full pt-[62px] pb-[72px]">
        {/* 사용자 프로필 */}
        {isPostLoading ? (
          <CommunityProfileSkel />
        ) : (
          <button
            onClick={goToMypage}
            className="mt-4 px-5 flex items-center h-[72px] cursor-pointer"
          >
            <div className="w-18 h-18 relative bg-[#f6f6f6] rounded-full flex items-center justify-center overflow-hidden">
              <Image
                src={profile_image ?? defaultImg}
                alt="profile-image"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col ml-3">
              <p className="text-[var(--color-gray-100)] font-bold text-lg dark:text-[var(--color-white)]">
                {nickname}
              </p>
              <p className="text-[var(--color-gray-70)] text-[13px] text-left">
                {interest.length > 0
                  ? interest.map((i) => categoryIdInvMap[i]).join(", ")
                  : "관심사가 없습니다"}
              </p>
            </div>
          </button>
        )}
        {/* 채널 */}
        <div className="w-full">
          <TabMenu
            tabs={categoryGroupMap}
            activeTab={selected}
            onTabClick={setSelected}
          />
        </div>

        {/* 게시글 목록 */}
        <div className="flex flex-col items-center px-5">
          {isPostLoading ? (
            <>
              <CommunityPostSkel />
              <CommunityPostSkel />
            </>
          ) : (
            <>
              {filteredPosts().map((post, i) => (
                <CommunityPost
                  key={i}
                  postId={post.post_id}
                  postImage={post.content_image}
                  writerId={post.user_id}
                  categoryId={post.category_id}
                  title={post.title}
                  content={post.contents}
                  views={post.view_count}
                  comments={post.comment_count}
                />
              ))}
            </>
          )}
        </div>

        {/* 새 글 추가 */}
        <IconButton
          ref={buttonRef}
          icon={Plus}
          onClick={(e) => {
            e.stopPropagation();
            setAdd((prev) => !prev);
          }}
          className={` fixed z-50 bottom-22  w-13 h-13 shadow-[2px_6px_12px_0_rgba(0,0,0,0.24)]
      transition-all duration-300 right-[calc((100vw-var(--container-width))/2+20px)] ease-in-out ${
        add
          ? "rotate-45 bg-[var(--color-white)] hover:bg-[var(--color-gray-10)] dark:hover:bg-[var(--color-gray-20)]"
          : "rotate-0 bg-[var(--color-black)] dark:bg-[var(--color-primary-40)] hover:bg-[var(--color-gray-100)] hover:dark:bg-[var(--color-primary-30)]"
      }`}
          size={24}
          color={color}
        />

        {add && (
          <div
            className="fixed inset-0 bg-[#191919]/50 z-30"
            onClick={(e) => {
              e.stopPropagation();
              if (e.target === e.currentTarget) {
                setAdd(false);
              }
            }}
          >
            <div className=" absolute z-30 bottom-[152px] right-5 ">
              <Dropdown
                isOpen={add}
                onClose={() => {
                  setAdd(false);
                }}
                triggerRef={buttonRef}
                items={[
                  {
                    icon: <PiPencilSimple />,
                    label: "새 글 작성",
                    onClick: goToCreate,
                  },
                  {
                    icon: <VscListSelection />,
                    label: "내가 작성한 글",
                    onClick: () => {
                      setAdd(false);
                      router.push(`/mypage`);
                    },
                  },
                ]}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
