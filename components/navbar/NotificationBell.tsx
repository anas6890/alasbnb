"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useRouter, usePathname } from "next/navigation";
import { pusherClient } from "@/lib/pusher";
import { SafeUser } from "@/types";
import { FiBell } from "react-icons/fi";
import { IoCheckmarkDone } from "react-icons/io5";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import useLanguage from "@/hook/useLanguage";
import { translations } from "@/lib/translations";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
  senderImage?: string;
}

interface Props {
  currentUser: SafeUser;
  /** true quand on est dans le dashboard hôte */
  isHostMode?: boolean;
}

export default function NotificationBell({ currentUser, isHostMode = false }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const locale = language === "fr" ? fr : enUS;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const filteredNotifications = notifications.filter((n) => {
    const isHostNotif = n.link?.startsWith("/hosting");
    return isHostMode ? isHostNotif : !isHostNotif;
  });

  const unreadCount = filteredNotifications.filter((n) => !n.isRead).length;

  // ── Charger les notifications initiales ──────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await axios.get("/api/notifications");
      setNotifications(res.data);
    } catch {
      // silencieux
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
    }
  }, [currentUser, fetchNotifications]);

  // Ref pour avoir le pathname actuel dans le handler sans re-subscribe
  const pathnameRef = useRef(pathname);
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  const routerRef = useRef(router);
  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  // ── Écouter les nouvelles notifications via Pusher ───────────────────
  // On ne met QUE currentUser.id en dépendance pour éviter de se
  // désabonner/ré-abonner à chaque changement de page.
  useEffect(() => {
    if (!currentUser?.id || !pusherClient) return;

    const channel = `user-${currentUser.id}`;
    const pusherChannel = pusherClient.subscribe(channel);

    console.log("[NotificationBell] Subscribed to", channel);

    const handler = (data: Notification & { senderName?: string; senderImage?: string }) => {
      console.log("[NotificationBell] notifications:new received", data);

      // Ajouter en tête de liste
      setNotifications((prev) => [{ ...data, isRead: false }, ...prev]);

      // Toast enrichi seulement si on n'est pas sur la page des messages ciblée
      const isTargetingHost = data.link?.startsWith("/hosting");
      const currentPath = pathnameRef.current || "";
      const onTargetMessagePage = isTargetingHost
        ? currentPath.includes("/hosting/messages")
        : currentPath.includes("/messages") && !currentPath.includes("/hosting");

      if (!onTargetMessagePage) {
        toast.info(
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-neutral-200 flex-none">
              {data.senderImage ? (
                <img src={data.senderImage} alt={data.senderName || ""} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-500 font-bold text-sm">
                  {(data.senderName || "?")[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-neutral-900 text-sm truncate">
                {data.senderName || data.title}
              </span>
              <span className="text-xs text-neutral-500 truncate">{data.body}</span>
            </div>
          </div>,
          {
            onClick: () => {
              if (data.link) routerRef.current.push(data.link);
              setIsOpen(false);
            },
            position: "top-right",
            autoClose: 6000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            style: { cursor: "pointer" },
          }
        );
      }
    };

    pusherChannel.bind("notifications:new", handler);

    return () => {
      console.log("[NotificationBell] Unsubscribed from", channel);
      pusherChannel.unbind("notifications:new", handler);
      pusherClient?.unsubscribe(channel);
    };
  }, [currentUser?.id]); // ← UNIQUEMENT l'ID, pas pathname ni router

  // ── Fermer le panneau en cliquant en dehors ────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Marquer toutes comme lues ─────────────────────────────────────
  const markAllRead = useCallback(async () => {
    try {
      await axios.patch("/api/notifications");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // silencieux
    }
  }, []);

  // ── Naviguer vers le lien d'une notification ──────────────────────
  const handleNotificationClick = useCallback(
    (notif: Notification) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
      setIsOpen(false);
      if (notif.link) {
        router.push(notif.link);
      }
      // Marquer celle-ci comme lue en DB (call silencieux)
      axios.patch("/api/notifications").catch(() => {});
    },
    [router]
  );

  return (
    <div className="relative" ref={panelRef}>
      {/* ── Bouton cloche ─────────────────────────────────────────── */}
      <button
        id="notification-bell-btn"
        aria-label="Notifications"
        onClick={() => setIsOpen((v) => !v)}
        className={`relative p-2.5 rounded-full transition-all duration-200 ${
          isOpen
            ? "bg-neutral-100 text-neutral-900"
            : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
        }`}
      >
        <FiBell size={22} />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* ── Panneau dropdown ─────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="notification-panel"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 top-12 w-[360px] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-neutral-100 overflow-hidden z-[200]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <FiBell size={18} className="text-neutral-700" />
                <h3 className="font-black text-neutral-900 text-[15px]">
                  {t.notifications_title || "Notifications"}
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-black bg-rose-100 text-rose-600 rounded-full uppercase tracking-wider">
                    {unreadCount} {t.notifications_new || "nouvelles"}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs font-bold text-neutral-400 hover:text-neutral-700 transition"
                >
                  <IoCheckmarkDone size={16} />
                  {t.notifications_mark_all_read || "Tout lire"}
                </button>
              )}
            </div>

            {/* Liste */}
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 gap-3 text-neutral-300">
                  <FiBell size={32} />
                  <p className="text-sm font-semibold">
                    {t.notifications_empty || "Aucune notification"}
                  </p>
                </div>
              ) : (
                filteredNotifications
                  .filter((n, i) => !n.isRead || i < 5)
                  .map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`w-full text-left flex items-start gap-3 px-5 py-4 border-b border-neutral-50 transition-colors ${
                      notif.isRead
                        ? "bg-white hover:bg-neutral-50"
                        : "bg-rose-50/40 hover:bg-rose-50/70"
                    }`}
                  >
                    {/* Icône message */}
                    <div className="relative flex-none mt-0.5">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center shadow-sm">
                        <span className="text-white text-base">💬</span>
                      </div>
                      {!notif.isRead && (
                        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] leading-snug ${notif.isRead ? "font-medium text-neutral-600" : "font-bold text-neutral-900"}`}>
                        {notif.title}
                      </p>
                      <p className="text-[12px] text-neutral-400 mt-0.5 line-clamp-2">
                        {notif.body}
                      </p>
                      <p className="text-[10px] text-neutral-300 mt-1 font-semibold uppercase tracking-wider">
                        {format(new Date(notif.createdAt), "d MMM 'à' HH:mm", { locale })}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
