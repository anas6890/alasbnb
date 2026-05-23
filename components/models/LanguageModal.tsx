"use client";

import useLanguage from "@/hook/useLanguage";
import useLanguageModal from "@/hook/useLanguageModal";
import useCurrency, { Currency } from "@/hook/useCurrency";
import Heading from "../Heading";
import { translations } from "@/lib/translations";
import Modal from "./Modal";

const LanguageModal = () => {
  const languageModal = useLanguageModal();
  const { language, setLanguage } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const t = translations[language] || translations.en;

  const languages = [
    { label: "Français", value: "fr", icon: "🇫🇷" },
    { label: "English", value: "en", icon: "🇺🇸" },
    { label: "Español", value: "es", icon: "🇪🇸" },
    { label: "Deutsch", value: "de", icon: "🇩🇪" },
  ];

  const currencies: { label: string, value: Currency, symbol: string }[] = [
    { label: "Euro", value: "EUR", symbol: "€" },
    { label: "US Dollar", value: "USD", symbol: "$" },
    { label: "British Pound", value: "GBP", symbol: "£" },
    { label: "Moroccan Dirham", value: "MAD", symbol: "DH" },
  ];

  const bodyContent = (
    <div className="flex flex-col gap-8">
      <div>
        <Heading
            title={t.lang_title}
            subtitle={t.lang_subtitle}
        />
        <div className="grid grid-cols-2 gap-3 mt-4">
            {languages.map((item) => (
            <div
                key={item.value}
                onClick={() => setLanguage(item.value)}
                className={`
                flex flex-row items-center gap-3 p-4 border-2 rounded-xl hover:border-black transition cursor-pointer
                ${language === item.value ? "border-black bg-neutral-50" : "border-neutral-200"}
                `}
            >
                <span className="text-2xl">{item.icon}</span>
                <div className="font-semibold">{item.label}</div>
            </div>
            ))}
        </div>
      </div>

      <div className="border-t pt-8">
        <Heading
            title={t.currency_title}
            subtitle={t.currency_subtitle}
        />
        <div className="grid grid-cols-2 gap-3 mt-4">
            {currencies.map((item) => (
            <div
                key={item.value}
                onClick={() => setCurrency(item.value)}
                className={`
                flex flex-row items-center gap-3 p-4 border-2 rounded-xl hover:border-black transition cursor-pointer
                ${currency === item.value ? "border-black bg-neutral-50" : "border-neutral-200"}
                `}
            >
                <span className="text-xl font-bold w-8 text-center">{item.symbol}</span>
                <div className="font-semibold">{item.label}</div>
            </div>
            ))}
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={languageModal.isOpen}
      title={t.display_settings}
      actionLabel={t.save}
      onClose={languageModal.onClose}
      onSubmit={languageModal.onClose}
      body={bodyContent}
    />
  );
};

export default LanguageModal;
