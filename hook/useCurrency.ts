import { create } from "zustand";

export type Currency = "EUR" | "USD" | "GBP" | "MAD";

interface CurrencyStore {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}

const useCurrency = create<CurrencyStore>((set) => ({
  currency: (typeof window !== "undefined" ? localStorage.getItem("currency") as Currency : "EUR") || "EUR",
  setCurrency: (currency: Currency) => {
    localStorage.setItem("currency", currency);
    set({ currency });
    // Optionnel : recharger ou simplement laisser Zustand mettre à jour les composants
  },
}));

export default useCurrency;
