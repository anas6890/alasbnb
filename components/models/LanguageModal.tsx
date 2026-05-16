"use client";

import useLanguage from "@/hook/useLanguage";
import useLanguageModal from "@/hook/useLanguageModal";
import Heading from "../Heading";
import Modal from "./Modal";

const LanguageModal = () => {
  const languageModal = useLanguageModal();
  const { language, setLanguage } = useLanguage();

  const languages = [
    { label: "Français", value: "fr", icon: "🇫🇷" },
    { label: "English", value: "en", icon: "🇺🇸" },
    { label: "Español", value: "es", icon: "🇪🇸" },
    { label: "Deutsch", value: "de", icon: "🇩🇪" },
  ];

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <Heading
        title="Choisir une langue"
        subtitle="Sélectionnez la langue préférée pour l'interface"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {languages.map((item) => (
          <div
            key={item.value}
            onClick={() => {
              setLanguage(item.value);
              languageModal.onClose();
            }}
            className={`
              flex 
              flex-row 
              items-center 
              gap-3 
              p-4 
              border-2 
              rounded-xl 
              hover:border-black 
              transition 
              cursor-pointer
              ${language === item.value ? "border-black" : "border-neutral-200"}
            `}
          >
            <span className="text-2xl">{item.icon}</span>
            <div className="font-semibold">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={languageModal.isOpen}
      title="Langue"
      actionLabel="Fermer"
      onClose={languageModal.onClose}
      onSubmit={languageModal.onClose}
      body={bodyContent}
    />
  );
};

export default LanguageModal;
