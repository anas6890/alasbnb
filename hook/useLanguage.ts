import { create } from "zustand";

interface LanguageStore {
  language: string;
  setLanguage: (language: string) => void;
}

const getLanguage = () => {
  if (typeof window !== "undefined") {
    // Check localStorage first
    const stored = localStorage.getItem("language");
    if (stored) return stored;
    // Check cookie
    const match = document.cookie.match(new RegExp('(^| )language=([^;]+)'));
    if (match) return match[2];
  }
  return "en";
};

const useLanguage = create<LanguageStore>((set) => ({
  language: getLanguage(),
  setLanguage: (language: string) => {
    localStorage.setItem("language", language);
    document.cookie = `language=${language}; path=/; max-age=31536000`; // 1 year
    set({ language });
    window.location.reload(); 
  },
}));

export default useLanguage;
