import { create } from "zustand";

interface UserData {
  userId: string | null;
  email: string | null;
  nickname: string | null;
  profile_image: string | null;
  age_range: string | null;
  gender: string | null;
}
interface UserState extends UserData {
  interest: string[];
  isInitialized: boolean;
  setUser: (data: Partial<UserState>) => void;
  clearUser: () => void;
}
export const useAuthStore = create<UserState>((set) => ({
  userId: null,
  email: null,
  nickname: null,
  profile_image: null,
  age_range: null,
  gender: null,
  interest: [],
  isInitialized: false,

  setUser: (data) =>
    set((state) => ({
      ...state,
      ...data,
      isInitialized: true,
    })),

  clearUser: async () => {
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:4000";

    await fetch(backendUrl + "/auth/logout", {
      method: "POST",
      credentials: "include",
    }).catch(() => null);

    set({
      userId: null,
      email: null,
      nickname: null,
      profile_image: null,
      age_range: null,
      gender: null,
      interest: [],
      isInitialized: true,
    });
  },
}));
