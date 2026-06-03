"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { SafeConversation, SafeMessage, SafeUser } from "@/types";
import Avatar from "@/components/Avatar";
import { pusherClient } from "@/lib/pusher";
import { useSearchParams } from "next/navigation";
import { IoChevronBack, IoSend, IoChatbubbleOutline } from "react-icons/io5";

import useLanguage from "@/hook/useLanguage";
import { translations } from "@/lib/translations";

interface MessagesClientProps {
  conversations: SafeConversation[];
  currentUser: SafeUser;
  isHostMode?: boolean;
}

const MessagesClient: React.FC<MessagesClientProps> = ({
  conversations: initialConversations,
  currentUser,
  isHostMode = false,
}) => {
  const searchParams = useSearchParams();
  const selectedId = searchParams?.get("selected");
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const locale = language === "fr" ? fr : enUS;

  const activeTab = isHostMode ? "host" : "guest";
  const [conversations, setConversations] = useState(initialConversations);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  
  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => 
        activeTab === "guest" ? conv.guestId === currentUser.id : conv.hostId === currentUser.id
    );
  }, [conversations, activeTab, currentUser.id]);

  const [selectedConversation, setSelectedConversation] = useState<SafeConversation | null>(null);

  useEffect(() => {
    if (selectedId) {
        const found = initialConversations.find(c => c.id === selectedId);
        if (found) {
            setSelectedConversation(found);
            setIsMobileChatOpen(true);
        }
    }
  }, [selectedId, initialConversations, currentUser.id]);

  const [messages, setMessages] = useState<SafeMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedConversation) {
      setIsLoading(true);
      axios.get(`/api/messages/${selectedConversation.id}`).then((res) => {
        setMessages(res.data);
        setIsLoading(false);
      });
    }
  }, [selectedConversation?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const [isSending, setIsSending] = useState(false);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || isSending) return;

    const content = newMessage;
    setNewMessage("");
    setIsSending(true);
    
    // Optimistic UI update
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const tempMessage = {
      id: tempId,
      content,
      senderId: currentUser.id,
      receiverId: getOtherUser(selectedConversation)?.id || "",
      conversationId: selectedConversation.id,
      createdAt: new Date().toISOString(),
      isRead: false,
    } as unknown as SafeMessage;
    
    setMessages((current) => [...current, tempMessage]);

    try {
      const res = await axios.post(`/api/messages/${selectedConversation.id}`, {
        content,
      });
      // Replace the temp message with the real one returned by the API
      // If Pusher already added it, just remove the temp one.
      setMessages((current) => {
        if (current.find((m) => m.id === res.data.id)) {
          return current.filter((m) => m.id !== tempId);
        }
        return current.map((m) => (m.id === tempId ? res.data : m));
      });
    } catch (error) {
      console.error("Failed to send message");
      // Remove temp message if failed
      setMessages((current) => current.filter((m) => m.id !== tempId));
    } finally {
      setIsSending(false);
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
    // Outer container ensures standard height when in Host Layout, and full height when standalone Guest mode
    <div className={`w-full ${isHostMode ? 'h-[calc(100vh-140px)] md:rounded-[32px] md:border md:shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)]' : 'h-[calc(100vh-80px)]'} flex overflow-hidden bg-white border-neutral-200 relative`}>
      
      {/* Sidebar: Conversations List */}
      <div className={`
        ${isMobileChatOpen ? 'hidden md:flex' : 'flex'}
        w-full md:w-80 lg:w-96 flex-col border-r border-neutral-100 bg-[#FAFAFA] z-20 shrink-0
      `}>
        <div className="p-6 md:p-8">
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
            {activeTab === "host" ? t.messages_host_title || 'Messagerie' : t.messages_guest_title || 'Vos messages'}
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4">
          {filteredConversations.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center gap-4">
              <div className="p-4 bg-white rounded-2xl text-neutral-300 shadow-sm border border-neutral-100">
                <IoChatbubbleOutline size={32} />
              </div>
              <p className="text-sm font-semibold text-neutral-400">
                {activeTab === "guest" ? t.msg_no_hosts || 'Aucun message.' : t.msg_no_guests || 'Aucun message.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredConversations.map((conv) => {
                const otherUser = getOtherUser(conv);
                const isSelected = selectedConversation?.id === conv.id;
                
                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`p-4 rounded-2xl cursor-pointer flex gap-4 transition-all duration-300 group ${
                      isSelected 
                        ? "bg-white shadow-sm border border-neutral-200" 
                        : "hover:bg-white hover:shadow-sm border border-transparent"
                    }`}
                  >
                    <div className="relative">
                      <Avatar src={otherUser?.image} />
                      {/* Active indicator dot placeholder */}
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`font-bold text-[15px] truncate ${isSelected ? 'text-neutral-900' : 'text-neutral-700 group-hover:text-neutral-900'}`}>
                          {otherUser?.firstname || t.msg_user || 'Utilisateur'}
                        </span>
                        <span className="text-[10px] font-semibold text-neutral-400 whitespace-nowrap ml-2">
                          {format(new Date(conv.updatedAt), "d MMM", { locale })}
                        </span>
                      </div>
                      
                      {conv.listing && (
                        <span className="text-xs text-neutral-500 font-medium truncate">
                          {activeTab === "guest" ? t.msg_regarding || 'À propos de ' : t.msg_your_listing || 'Annonce : '} 
                          {conv.listing.title}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`
        ${isMobileChatOpen ? 'flex' : 'hidden md:flex'}
        flex-col flex-1 bg-white relative z-30
      `}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-5 border-b border-neutral-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <button 
                    onClick={() => setIsMobileChatOpen(false)}
                    className="md:hidden p-2 -ml-2 text-neutral-500 hover:bg-neutral-100 rounded-full transition-colors"
                >
                    <IoChevronBack size={24} />
                </button>
                <Avatar src={getOtherUser(selectedConversation)?.image} />
                <div className="flex flex-col">
                  <h2 className="font-black text-neutral-900 text-[17px]">{getOtherUser(selectedConversation)?.firstname}</h2>
                  <span className="text-xs font-semibold text-green-500">{t.msg_online || 'En ligne'}</span>
                </div>
              </div>
              
              {selectedConversation.listing && (
                  <div className="flex items-center gap-2 md:gap-3 bg-[#FAFAFA] px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-neutral-200 ml-auto">
                      <div className="hidden sm:block w-7 h-7 md:w-8 md:h-8 rounded-full overflow-hidden shadow-sm relative shrink-0">
                          <img src={selectedConversation.listing.images?.[0]} className="object-cover w-full h-full" alt="listing" />
                      </div>
                      <div className="flex flex-col text-right sm:text-left">
                          <span className="text-[9px] md:text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{t.msg_listing || 'Annonce'}</span>
                          <span className="text-[11px] md:text-xs font-bold text-neutral-800 truncate max-w-[100px] md:max-w-[150px]">{selectedConversation.listing.title}</span>
                      </div>
                  </div>
              )}
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-4 custom-scrollbar bg-white">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="w-8 h-8 border-4 border-neutral-200 border-t-neutral-800 rounded-full animate-spin"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-neutral-400 gap-3">
                  <div className="p-6 bg-neutral-50 rounded-full">
                    <IoChatbubbleOutline size={32} className="text-neutral-300" />
                  </div>
                  <span className="text-sm font-semibold">{t.msg_start || 'Dites bonjour à'} {getOtherUser(selectedConversation)?.firstname}</span>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isMine = message.senderId === currentUser.id;
                  
                  // Add logic for grouping messages to round corners conditionally
                  const isFirstInGroup = index === 0 || messages[index - 1].senderId !== message.senderId;
                  const isLastInGroup = index === messages.length - 1 || messages[index + 1].senderId !== message.senderId;
                  
                  const isAutoMessage = Object.values(translations).some((trans: any) => trans.host_reservations_contact_message === message.content);
                  const displayedContent = isAutoMessage ? (t.host_reservations_contact_message as string) : message.content;
                  
                  let roundedClass = 'rounded-[20px]';
                  if (isMine) {
                    if (!isFirstInGroup && !isLastInGroup) roundedClass = 'rounded-[20px] rounded-r-md';
                    else if (!isFirstInGroup && isLastInGroup) roundedClass = 'rounded-[20px] rounded-tr-md rounded-br-[4px]';
                    else if (isFirstInGroup && !isLastInGroup) roundedClass = 'rounded-[20px] rounded-tr-[4px] rounded-br-md';
                    else roundedClass = 'rounded-[20px] rounded-br-[4px]'; // Single message
                  } else {
                    if (!isFirstInGroup && !isLastInGroup) roundedClass = 'rounded-[20px] rounded-l-md';
                    else if (!isFirstInGroup && isLastInGroup) roundedClass = 'rounded-[20px] rounded-tl-md rounded-bl-[4px]';
                    else if (isFirstInGroup && !isLastInGroup) roundedClass = 'rounded-[20px] rounded-tl-[4px] rounded-bl-md';
                    else roundedClass = 'rounded-[20px] rounded-bl-[4px]'; // Single message
                  }

                  return (
                    <div
                      key={message.id}
                      className={`flex flex-col ${isMine ? "items-end" : "items-start"} w-full animate-in fade-in slide-in-from-bottom-1 duration-300 ${!isFirstInGroup ? 'mt-0.5' : 'mt-4'}`}
                    >
                      <div className="flex flex-col w-full max-w-[85%] md:max-w-[70%]">
                        <div
                          className={`px-5 py-3 text-[15px] leading-relaxed w-fit ${isMine ? "ml-auto" : "mr-auto"} ${roundedClass} ${
                            isMine
                              ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-sm"
                              : "bg-[#F0F0F0] text-neutral-900"
                          }`}
                        >
                          {displayedContent.split('\n').map((line, i) => (
                            <span key={i}>
                                {line}
                                <br/>
                            </span>
                          ))}
                        </div>
                        {isLastInGroup && (
                           <span className={`text-[10px] font-semibold text-neutral-400 mt-1 ${isMine ? 'text-right' : 'text-left'}`}>
                             {format(new Date(message.createdAt), "HH:mm")}
                           </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Chat Input */}
            <div className="p-4 md:px-8 md:py-6 bg-white border-t border-neutral-100">
              <div className="flex items-end gap-3 bg-[#FAFAFA] border border-neutral-200 rounded-3xl p-2 focus-within:border-neutral-400 focus-within:bg-white transition-all shadow-sm">
                <textarea
                  className="flex-1 bg-transparent outline-none max-h-32 min-h-[44px] resize-none px-4 py-2.5 text-[15px] placeholder:text-neutral-400"
                  placeholder={t.msg_write_here || 'Écrivez votre message...'}
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
                  className="w-11 h-11 mb-0.5 flex items-center justify-center bg-neutral-900 text-white rounded-full hover:bg-black transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  <IoSend size={18} className="ml-1" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white flex-col gap-4 text-neutral-300">
            <div className="p-6 bg-[#FAFAFA] rounded-full border border-neutral-100">
                <IoChatbubbleOutline size={48} className="text-neutral-200" />
            </div>
            <div className="text-center flex flex-col">
                <h3 className="text-xl font-black text-neutral-800">{t.msg_select || 'Sélectionnez une discussion'}</h3>
                <p className="text-sm text-neutral-400 mt-1">{t.msg_to_start || 'Pour commencer à échanger'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesClient;