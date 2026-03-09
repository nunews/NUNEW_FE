import { useRef, useState } from "react";
import Input from "../ui/Input";
import { TextButton } from "../ui/TextButton";
import Image from "next/image";
import defaultProfile from "../../assets/images/default_profile.png";
import { toast } from "sonner";
import createClient from "@/utils/supabase/client";
import { generateRandomNickname } from "@/utils/generateRandomNickname";
import { Dices } from "lucide-react";
import { IMAGE_ALLOWED_TYPES, IMAGE_MAX_SIZE } from "@/lib/constants/files";

const ProfileEditForm = ({
  nickname,
  setNickname,
  currentNickname,
  setProfileImage,
  currentProfileImage,
  setIsNicknameChecked,
}: ProfileEditFormProps) => {
  const [previewImage, setPreviewImage] = useState<string | null>(
    currentProfileImage
  );
  const [checking, setChecking] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [nicknameError, setNicknameError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const supabase = createClient();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 타입 지정하고 해당 타입만 가능
    //
    if (!IMAGE_ALLOWED_TYPES.includes(file.type)) {
      toast.error("PNG, JPG, JPEG 파일만 업로드 가능합니다.");
      e.target.value = "";
      return;
    }

    if (file.size > IMAGE_MAX_SIZE) {
      toast.error("파일 크기는 5MB 이하만 가능합니다.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreviewImage(result);
      if (setProfileImage) setProfileImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleClick = () => fileInputRef.current?.click();

  const handleNicknameChange = (value: string) => {
    setNickname(value);
    setIsNicknameChecked(false);

    if (!value.trim()) {
      setNicknameError(null);
      return;
    }

    const regex = /^[가-힣a-zA-Z0-9]{2,10}$/;
    if (!regex.test(value)) {
      setNicknameError("닉네임은 2~10자의 한글, 영문, 숫자만 사용 가능합니다.");
    } else {
      setNicknameError(null);
    }
  };

  const handleCheckDuplicate = async () => {
    if (!nickname.trim()) {
      toast.error("닉네임을 입력해 주세요.");
      return;
    }

    // 유효하지 않으면 중복확인 중단
    if (nicknameError) return;

    if (nickname === currentNickname) {
      toast("현재 사용 중인 닉네임입니다.");
      setIsNicknameChecked(true);
      return;
    }

    try {
      setChecking(true);
      const { data, error } = await supabase
        .from("User")
        .select("user_id")
        .eq("nickname", nickname)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        toast.error("이미 사용 중인 닉네임입니다.");
        setIsNicknameChecked(false);
      } else {
        toast.success("사용 가능한 닉네임입니다.");
        setIsNicknameChecked(true);
      }
    } catch (err) {
      console.error(err);
      toast.error("중복 확인 중 오류가 발생했습니다.");
    } finally {
      setChecking(false);
    }
  };

  const handleRandomNickname = () => {
    const random = generateRandomNickname();
    setNickname(random);
    setIsNicknameChecked(false);
    setNicknameError(null);
  };

  return (
    <div className="flex flex-col gap-5 pb-5">
      <h1 className="text-[#191919] pt-5 text-[22px] font-bold dark:text-[var(--color-white)]">
        내 정보 수정
      </h1>

      {/* 프로필 이미지 */}
      <div className="flex justify-center">
        <div
          className="relative w-24 h-24 rounded-full overflow-hidden cursor-pointer group"
          onClick={handleClick}
        >
          <Image
            src={previewImage || defaultProfile}
            alt="프로필 이미지"
            fill
            className="object-cover transition duration-300 group-hover:opacity-70"
          />
          <div className="absolute inset-0 bg-gray-800/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
            <span className="text-white text-sm font-medium">이미지 변경</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
      </div>

      {/* 닉네임 변경 */}
      <div>
        <p className="pb-2 text-[var(--color-gray-80)]">닉네임 변경</p>
        <div className="flex items-center gap-2">
          <Input
            placeholder={currentNickname || "닉네임"}
            value={nickname}
            onChange={(e) => handleNicknameChange(e.target.value)}
            rightSlot={
              <TextButton
                className="text-[var(--color-black)]"
                onClick={handleCheckDuplicate}
                disabled={checking}
              >
                중복확인
              </TextButton>
            }
          />

          {/* 랜덤 닉네임 버튼 */}
          <button
            type="button"
            onClick={handleRandomNickname}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="cursor-pointer w-12 h-12 flex items-center justify-center border border-[#DFDFDF] rounded-[8px]
              hover:bg-[#F2F2F2] dark:border-[#4D4D4D] dark:hover:bg-[#515151]"
          >
            <Dices
              style={{
                transform: isHovered ? "rotate(306deg)" : "rotate(0deg)",
                transition: "transform 0.6s cubic-bezier(0.4,0,0.2,1)",
              }}
              className="w-5 h-5 dark:text-white"
            />
          </button>
        </div>

        {nicknameError && (
          <p className="text-red-500 text-sm mt-1">{nicknameError}</p>
        )}
      </div>
    </div>
  );
};

export default ProfileEditForm;
