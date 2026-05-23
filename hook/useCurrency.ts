import { create } from "zustand";

export type Currency = "EUR" | "USD" | "GBP" | "MAD";

interface CurrencyStore {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}

const getCurrency = (): Currency => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("currency");
    if (stored) return stored as Currency;
    const match = document.cookie.match(new RegExp('(^| )currency=([^;]+)'));
    if (match) return match[2] as Currency;
  }
  return "EUR";
};

const useCurrency = create<CurrencyStore>((set) => ({
  currency: getCurrency(),
  setCurrency: (currency: Currency) => {
    localStorage.setItem("currency", currency);
    document.cookie = `currency=${currency}; path=/; max-age=31536000`; // 1 year
    set({ currency });
    window.location.reload(); 
  },
}));

export default useCurrency;
