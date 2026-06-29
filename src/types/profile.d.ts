interface ProfileEditFormProps {
  nickname: string;
  setNickname: (value: string) => void;
  currentNickname: string;
  currentProfileImage: string | null;
  setProfileImage?: (value: File) => void;
  setIsNicknameChecked: (value: boolean) => void;
  isNicknameChecked: boolean;
}
