import { create } from "zustand";

interface LanguageModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const useLanguageModal = create<LanguageModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export default useLanguageModal;
