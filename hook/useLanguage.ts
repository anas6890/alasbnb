import { create } from "zustand";

interface LanguageStore {
  language: string;
  setLanguage: (language: string) => void;
}

const useLanguage = create<LanguageStore>((set) => ({
  language: typeof window !== "undefined" ? localStorage.getItem("language") || "en" : "en",
  setLanguage: (language: string) => {
    localStorage.setItem("language", language);
    set({ language });
    window.location.reload(); 
  },
}));

export default useLanguage;
