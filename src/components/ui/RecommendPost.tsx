import { useRouter } from "next/navigation";
import { AiOutlineLike } from "react-icons/ai";
import { IoEyeOutline } from "react-icons/io5";

interface RecommendPostProps {
  postId: number;
  title: string;
  content: string;
  likes: number;
  views: number;
}

export default function RecommendPost({
  postId,
  title,
  content,
  likes,
  views,
}: RecommendPostProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/community/${postId}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-[var(--color-white)] hover:bg-[var(--color-gray-10)] transition-all duration-300 rounded-xl py-5 px-4 border border-[var(--color-gray-30)] cursor-pointer
      dark:bg-[#121212] dark:hover:bg-[var(--color-gray-100)]/30 dark:border-[var(--color-gray-100)]"
    >
      <div className="mb-2">
        <p className="text-[#313131] dark:text-[var(--color-gray-20)] font-semibold line-clamp-1">
          {title}
        </p>
      </div>
      <div className="mb-4">
        <p className="text-sm text-[#8f8f8f]">{content}</p>
      </div>
      <div className="flex items-center gap-[11px]">
        <div className="flex items-center gap-[3px]">
          <AiOutlineLike className="w-4 h-4 text-[#b7b7b7]" />
          <span className="text-sm text-[#b7b7b7]">{likes}</span>
        </div>
        <div className="flex items-center gap-[3px]">
          <IoEyeOutline className="w-4 h-4 text-[#b7b7b7]" />
          <span className="text-sm text-[#b7b7b7]">{views}</span>
        </div>
      </div>
    </div>
  );
}
