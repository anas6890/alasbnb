"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import useLanguage from "@/hook/useLanguage";

const footerLinks = {
  fr: {
    about: { title: "À propos", links: ["Newsroom", "Nouvelles fonctionnalités", "Lettre de nos fondateurs", "Carrières", "Investisseurs"] },
    support: { title: "Support", links: ["Centre d'aide", "AirCover", "Options d'annulation", "Sécurité", "Signaler un problème"] },
    community: { title: "Communauté", links: ["AlasBnB.org", "Combattre la discrimination", "Soutenir les réfugiés", "Célébrations"] },
    hosting: { title: "Devenir hôte", links: ["Essayer d'accueillir", "AirCover pour hôtes", "Ressources", "Forum communautaire"] },
  },
  en: {
    about: { title: "About", links: ["Newsroom", "New features", "Letter from our founders", "Careers", "Investors"] },
    support: { title: "Support", links: ["Help Center", "AirCover", "Cancellation options", "Safety", "Report a concern"] },
    community: { title: "Community", links: ["AlasBnB.org", "Fight discrimination", "Support refugees", "Celebrations"] },
    hosting: { title: "Hosting", links: ["Try hosting", "AirCover for Hosts", "Resources", "Community forum"] },
  },
};



export default function Footer() {
  const { language } = useLanguage();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  const isFr = language === "fr";
  const links = isFr ? footerLinks.fr : footerLinks.en;
  const sections = Object.values(links);

  return (
    <footer className="bg-[#f7f7f7] border-t border-neutral-200">
      {/* Main links */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        {sections.map((section) => (
          <div key={section.title}>
            <h4 className="text-[13px] font-bold text-neutral-900 uppercase tracking-wider mb-4">
              {section.title}
            </h4>
            <ul className="space-y-2">
              {section.links.map((link) => (
                <li key={link}>
                  <span className="text-[13px] text-neutral-500 hover:text-brand-600 cursor-pointer transition-colors">
                    {link}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/assets/logo.png" alt="AlasBnB" width={90} height={32} className="object-contain" />
            <span className="text-[13px] text-neutral-400">
              © {new Date().getFullYear()} AlasBnB, Inc.
            </span>
          </div>
          <div className="flex items-center gap-4 text-neutral-400">
            <a href="#" aria-label="Facebook" className="hover:text-brand-500 transition-colors">
              <FaFacebookF size={16} />
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-brand-500 transition-colors">
              <FaTwitter size={16} />
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-brand-500 transition-colors">
              <FaInstagram size={16} />
            </a>
            <a href="#" aria-label="LinkedIn" className="hover:text-brand-500 transition-colors">
              <FaLinkedinIn size={16} />
            </a>
          </div>
          <div className="flex items-center gap-4 text-[13px] text-neutral-500">
            <span className="hover:underline cursor-pointer">{isFr ? "Confidentialité" : "Privacy"}</span>
            <span className="text-neutral-300">·</span>
            <span className="hover:underline cursor-pointer">{isFr ? "Conditions" : "Terms"}</span>
            <span className="text-neutral-300">·</span>
            <span className="hover:underline cursor-pointer">{isFr ? "Plan du site" : "Sitemap"}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}