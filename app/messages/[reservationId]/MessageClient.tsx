"use client";

import { SafeUser } from "@/types";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Container from "@/components/Container";
import Heading from "@/components/Heading";
import Image from "next/image";
import { TbSend } from "react-icons/tb";

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
    const interval = setInterval(fetchMessages, 5000); // Poll every 5s for simplicity
    return () => clearInterval(interval);
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
    <Container>
      <div className="max-w-4xl mx-auto pt-24 pb-12 h-[calc(100vh-100px)] flex flex-col">
        <div className="flex items-center gap-4 border-b border-neutral-200 pb-4 mb-4">
          <div className="relative w-12 h-12 rounded-full overflow-hidden">
            <Image src={receiverImage || "/images/placeholder.jpg"} alt="avatar" fill className="object-cover"/>
          </div>
          <div>
            <div className="font-bold text-lg">{receiverName}</div>
            <div className="text-sm text-neutral-500 line-clamp-1">{listingTitle}</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4 flex flex-col">
          {isLoading && messages.length === 0 ? (
            <div className="flex-1 flex justify-center items-center text-neutral-500">Chargement des messages...</div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex justify-center items-center text-neutral-500">Commencez la conversation !</div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] px-4 py-2 rounded-2xl ${isMe ? "bg-teal-500 text-white rounded-tr-sm" : "bg-neutral-100 text-neutral-800 rounded-tl-sm"}`}>
                    <div>{msg.content}</div>
                    <div className={`text-[10px] mt-1 ${isMe ? "text-teal-100" : "text-neutral-400"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], {hour: "2-digit", minute:"2-digit"})}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="flex gap-2 items-center bg-white p-2 rounded-full border border-neutral-300 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition shadow-sm">
          <input
            type="text"
            placeholder="Écrivez un message..."
            className="flex-1 px-4 py-2 outline-none bg-transparent"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit" disabled={!newMessage.trim()} className="bg-teal-500 text-white p-3 rounded-full hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition">
            <TbSend size={20} />
          </button>
        </form>
      </div>
    </Container>
  );
}
