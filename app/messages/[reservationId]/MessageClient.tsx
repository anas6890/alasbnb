"use client";

import { SafeUser } from "@/types";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Container from "@/components/Container";
import Heading from "@/components/Heading";
import Image from "next/image";
import { TbSend } from "react-icons/tb";

import { pusherClient } from "@/lib/pusher";

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
}

interface MessageClientProps {
  currentUser: SafeUser;
  reservationId: string;
  receiverId: string;
  receiverName: string;
  receiverImage: string | null;
  listingTitle: string;
}

export default function MessageClient({
  currentUser,
  reservationId,
  receiverId,
  receiverName,
  receiverImage,
  listingTitle
}: MessageClientProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`/api/messages/${reservationId}`);
        setMessages(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    if (pusherClient) {
      pusherClient.subscribe(reservationId);

      const messageHandler = (message: Message) => {
        setMessages((prev) => {
          // Avoid duplicate messages if optimistic update already added it
          if (prev.find((m) => m.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });
      };

      pusherClient.bind("messages:new", messageHandler);

      return () => {
        if (pusherClient) {
          pusherClient.unsubscribe(reservationId);
          pusherClient.unbind("messages:new", messageHandler);
        }
      };
    }
  }, [reservationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const content = newMessage;
    setNewMessage("");

    // Optimistic update
    const optimisticMessage = {
      id: Math.random().toString(),
      content,
      senderId: currentUser.id,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      await axios.post(`/api/messages/${reservationId}`, {
        content,
        receiverId
      });
      // Will be refreshed by the interval or we can just fetch inline
      const res = await axios.get(`/api/messages/${reservationId}`);
      setMessages(res.data);
    } catch (error) {
      console.error(error);
      // rollback could be added here
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-[#FAFAFA]">
      <div className="max-w-5xl mx-auto w-full flex flex-col h-full bg-white shadow-sm border-x border-neutral-100">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-neutral-200 px-8 py-6">
          <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-[#00B4D8] flex items-center justify-center text-white font-bold text-xl">
            {receiverImage ? (
              <Image src={receiverImage} alt="avatar" fill className="object-cover" />
            ) : (
              receiverName.slice(0, 2).toUpperCase()
            )}
          </div>
          <div className="flex flex-col">
            <h2 className="font-bold text-xl text-neutral-900">{receiverName}</h2>
            <p className="text-sm text-neutral-500 font-light truncate max-w-lg">{listingTitle}</p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 flex flex-col">
          {isLoading && messages.length === 0 ? (
            <div className="flex-1 flex justify-center items-center text-neutral-400 font-medium">Chargement des messages...</div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex justify-center items-center text-neutral-400 font-medium">Commencez la conversation !</div>
          ) : (
            messages.map((msg, index) => {
              const isMe = msg.senderId === currentUser.id;
              const prevMsg = index > 0 ? messages[index - 1] : null;
              const showAvatar = !isMe && (!prevMsg || prevMsg.senderId !== msg.senderId);

              return (
                <div key={msg.id} className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
                  {!isMe && (
                    <div className="w-8 h-8 mr-2 flex-shrink-0">
                      {showAvatar && (
                        <div className="relative w-full h-full rounded-full overflow-hidden bg-[#00B4D8] flex items-center justify-center text-white text-[10px] font-bold">
                          {receiverImage ? (
                            <Image src={receiverImage} alt="avatar" fill className="object-cover" />
                          ) : (
                            receiverName.slice(0, 2).toUpperCase()
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[75%]`}>
                    <div 
                      className={`px-5 py-3 rounded-[24px] text-[15px] leading-relaxed shadow-sm
                      ${isMe 
                        ? "bg-neutral-900 text-white rounded-br-[8px]" 
                        : "bg-white border border-neutral-200 text-neutral-800 rounded-bl-[8px]"}`}
                    >
                      {msg.content}
                    </div>
                    <div className="text-[11px] font-medium text-neutral-400 mt-1 mx-2">
                      {new Date(msg.createdAt).toLocaleTimeString([], {hour: "2-digit", minute:"2-digit"})}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} className="h-1" />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-neutral-100">
          <form 
            onSubmit={sendMessage} 
            className="flex gap-3 items-center bg-white pl-6 pr-2 py-2 rounded-full border border-neutral-200 shadow-sm focus-within:border-neutral-400 focus-within:shadow-md transition-all duration-300"
          >
            <input
              type="text"
              placeholder="Écrivez un message..."
              className="flex-1 outline-none bg-transparent text-[15px] font-medium placeholder-neutral-400 text-neutral-800"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button 
              type="submit" 
              disabled={!newMessage.trim()} 
              className="bg-[#00B4D8] text-white p-3 rounded-full hover:bg-[#0096B4] disabled:opacity-50 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              <TbSend size={20} className="-ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
