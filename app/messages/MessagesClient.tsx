"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { SafeConversation, SafeMessage, SafeUser } from "@/types";
import Avatar from "@/components/Avatar";
import { pusherClient } from "@/lib/pusher";
import { useSearchParams } from "next/navigation";
import { IoChevronBack } from "react-icons/io5";

interface MessagesClientProps {
  conversations: SafeConversation[];
  currentUser: SafeUser;
}

const MessagesClient: React.FC<MessagesClientProps> = ({
  conversations: initialConversations,
  currentUser,
}) => {
  const searchParams = useSearchParams();
  const selectedId = searchParams?.get("selected");

  const [activeTab, setActiveTab] = useState<"guest" | "host">("guest");
  const [conversations, setConversations] = useState(initialConversations);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  
  // Filter conversations based on role
  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => 
        activeTab === "guest" ? conv.guestId === currentUser.id : conv.hostId === currentUser.id
    );
  }, [conversations, activeTab, currentUser.id]);

  const [selectedConversation, setSelectedConversation] = useState<SafeConversation | null>(null);

  // Auto-switch tab and open chat if selectedId exists
  useEffect(() => {
    if (selectedId) {
        const found = initialConversations.find(c => c.id === selectedId);
        if (found) {
            setActiveTab(found.guestId === currentUser.id ? "guest" : "host");
            setSelectedConversation(found);
            setIsMobileChatOpen(true);
        }
    }
  }, [selectedId, initialConversations, currentUser.id]);

  const [messages, setMessages] = useState<SafeMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      setIsLoading(true);
      axios.get(`/api/messages/${selectedConversation.id}`).then((res) => {
        setMessages(res.data);
        setIsLoading(false);
      });
    }
  }, [selectedConversation?.id]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Pusher for real-time messages
  useEffect(() => {
    if (!selectedConversation || !pusherClient) return;

    pusherClient.subscribe(`conversation-${selectedConversation.id}`);

    const messageHandler = (message: SafeMessage) => {
      setMessages((current) => {
        if (current.find((m) => m.id === message.id)) {
          return current;
        }
        return [...current, message];
      });

      // Update conversation in sidebar list to top with new timestamp
      setConversations((current) => {
          const updatedConversations = [...current];
          const index = updatedConversations.findIndex(c => c.id === selectedConversation.id);
          if (index > -1) {
              const [conv] = updatedConversations.splice(index, 1);
              conv.updatedAt = message.createdAt;
              updatedConversations.unshift(conv);
          }
          return updatedConversations;
      });
    };

    pusherClient.bind("messages:new", messageHandler);

    return () => {
      pusherClient?.unsubscribe(`conversation-${selectedConversation.id}`);
      pusherClient?.unbind("messages:new", messageHandler);
    };
  }, [selectedConversation?.id]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const content = newMessage;
    setNewMessage("");

    try {
      await axios.post(`/api/messages/${selectedConversation.id}`, {
        content,
      });
    } catch (error) {
      console.error("Failed to send message");
    }
  };

  const getOtherUser = (conversation: SafeConversation) => {
    return conversation.guestId === currentUser.id ? conversation.host : conversation.guest;
  };

  const handleSelectConversation = (conv: SafeConversation) => {
      setSelectedConversation(conv);
      setIsMobileChatOpen(true);
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-neutral-50 overflow-hidden relative">
      {/* Sidebar: Conversations List */}
      <div className={`
        ${isMobileChatOpen ? 'hidden md:flex' : 'flex'}
        w-full md:w-1/3 lg:w-1/4 border-r border-neutral-200 bg-white flex-col z-20
      `}>
        <div className="p-6 border-b border-neutral-200 bg-white">
          <h1 className="text-2xl font-black text-neutral-900 mb-6 italic tracking-tight">Messages</h1>
          
          {/* Tabs for Guest/Host */}
          <div className="flex bg-neutral-100 p-1.5 rounded-2xl shadow-inner border border-neutral-200/50">
            <button 
                onClick={() => {
                    setActiveTab("guest");
                    setSelectedConversation(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'guest' ? 'bg-white text-neutral-900 shadow-md transform scale-[1.02]' : 'text-neutral-500 hover:text-neutral-700'}`}
            >
                Voyageur
            </button>
            <button 
                onClick={() => {
                    setActiveTab("host");
                    setSelectedConversation(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'host' ? 'bg-white text-neutral-900 shadow-md transform scale-[1.02]' : 'text-neutral-500 hover:text-neutral-700'}`}
            >
                Hôte
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredConversations.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center gap-6">
              <div className="p-6 bg-neutral-50 rounded-full text-neutral-200 border border-neutral-100 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                </svg>
              </div>
              <p className="text-[15px] font-bold text-neutral-400 max-w-[200px] leading-snug">
                {activeTab === "guest" 
                    ? "Aucune discussion avec vos hôtes pour le moment." 
                    : "Vous n'avez pas encore reçu de demandes."}
              </p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const otherUser = getOtherUser(conv);
              const isSelected = selectedConversation?.id === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`p-5 cursor-pointer flex gap-4 hover:bg-neutral-50/80 transition-all border-b border-neutral-100 group relative ${
                    isSelected ? "bg-neutral-50 border-l-[6px] border-l-neutral-900" : "border-l-[6px] border-l-transparent"
                  }`}
                >
                  <Avatar src={otherUser?.image} />
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex justify-between items-center w-full mb-0.5">
                      <span className="font-black text-[15px] truncate text-neutral-900 group-hover:text-brand-600 transition-colors">
                        {otherUser?.firstname || "Utilisateur"}
                      </span>
                      <span className="text-[10px] font-black uppercase text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-md">
                        {format(new Date(conv.updatedAt), "d MMM", { locale: fr })}
                      </span>
                    </div>
                    {conv.listing && (
                      <span className="text-[12px] text-neutral-500 font-bold truncate italic">
                        {activeTab === "guest" ? "Concernant : " : "Votre annonce : "}{conv.listing.title}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`
        ${isMobileChatOpen ? 'flex' : 'hidden md:flex'}
        flex-col flex-1 bg-white z-30
      `}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 md:p-6 border-b border-neutral-100 flex justify-between items-center shadow-sm z-10 bg-white">
              <div className="flex items-center gap-4">
                <button 
                    onClick={() => setIsMobileChatOpen(false)}
                    className="md:hidden p-2 -ml-2 hover:bg-neutral-100 rounded-full transition"
                >
                    <IoChevronBack size={24} className="text-neutral-900" />
                </button>
                <Avatar src={getOtherUser(selectedConversation)?.image} />
                <div className="flex flex-col">
                  <h2 className="font-black text-neutral-900 text-lg">{getOtherUser(selectedConversation)?.firstname}</h2>
                  <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]"></div>
                      <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-tighter">En ligne</p>
                  </div>
                </div>
              </div>
              
              {selectedConversation.listing && (
                  <div className="hidden lg:flex items-center gap-3 bg-neutral-50 px-4 py-2 rounded-2xl border border-neutral-100">
                      <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm">
                          <img src={selectedConversation.listing.images?.[0]} className="object-cover w-full h-full" alt="listing" />
                      </div>
                      <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Annonce</span>
                          <span className="text-xs font-bold text-neutral-800 truncate max-w-[150px]">{selectedConversation.listing.title}</span>
                      </div>
                  </div>
              )}
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-[#fcfcfc] custom-scrollbar">
              {isLoading ? (
                <div className="flex justify-center items-center h-full text-neutral-400">
                  <div className="animate-pulse font-black uppercase tracking-widest text-xs">Chargement de vos échanges...</div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex justify-center items-center h-full text-neutral-400 text-sm italic">
                  Début de votre conversation avec {getOtherUser(selectedConversation)?.firstname}
                </div>
              ) : (
                messages.map((message) => {
                  const isMine = message.senderId === currentUser.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}
                    >
                      <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${isMine ? "items-end" : "items-start"}`}>
                        <div
                          className={`p-4 rounded-[24px] text-[15px] font-medium shadow-sm leading-relaxed ${
                            isMine
                              ? "bg-neutral-900 text-white rounded-tr-none shadow-neutral-200"
                              : "bg-white border-2 border-neutral-100 text-neutral-800 rounded-tl-none shadow-neutral-100"
                          }`}
                        >
                          {message.content.split('\n').map((line, i) => (
                            <span key={i}>
                                {line}
                                <br/>
                            </span>
                          ))}
                        </div>
                        <span className="text-[10px] font-black text-neutral-400 mt-2 px-2 uppercase tracking-tighter italic">
                          {format(new Date(message.createdAt), "HH:mm")}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-6 bg-white border-t border-neutral-100">
              <div className="flex items-end gap-3 bg-neutral-50 p-3 rounded-3xl border-2 border-neutral-100 focus-within:border-neutral-900 focus-within:bg-white transition-all duration-300 shadow-inner">
                <textarea
                  className="flex-1 bg-transparent outline-none max-h-32 min-h-[44px] resize-none px-4 py-2.5 text-[15px] font-medium placeholder:text-neutral-400"
                  placeholder="Écrivez votre message ici..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-3 mb-1 bg-neutral-900 text-white rounded-2xl hover:bg-black transition-all shadow-md disabled:opacity-30 disabled:cursor-not-allowed transform active:scale-95 group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 group-hover:rotate-12 transition-transform">
                    <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-neutral-50 flex-col gap-6 text-neutral-300 p-10">
            <div className="p-8 bg-white rounded-[40px] shadow-sm border border-neutral-100">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-20 h-20 opacity-40">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                </svg>
            </div>
            <div className="text-center flex flex-col gap-2">
                <p className="text-xl font-black text-neutral-800 italic">Sélectionnez une discussion</p>
                <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Pour commencer à échanger</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesClient;