"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  contenu: string;
  created_at: string;
}

interface ConversationDetail {
  id: string;
  agent_id: string;
  visitor_id: string;
  listing_id: string | null;
  visitor: {
    nom_agence: string;
    logo_url: string | null;
  } | null;
  listing: {
    titre: string;
    photos: string[];
  } | null;
}

export default function DashboardConversationPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;

  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const supabase = createClient();

    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;
      setUserId(user.id);

      // Fetch conversation
      const { data: conv } = await supabase
        .from("conversations")
        .select(
          "*, visitor:profiles!conversations_visitor_id_fkey(nom_agence, logo_url), listing:listings(titre, photos)"
        )
        .eq("id", conversationId)
        .single();

      if (conv) setConversation(conv as ConversationDetail);

      // Fetch messages
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      setMessages((msgs as Message[]) ?? []);
      setLoading(false);

      // Mark as read for agent
      await supabase
        .from("conversations")
        .update({ agent_non_lu: 0 })
        .eq("id", conversationId);
    }

    init();

    // Realtime subscription
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          // Mark as read
          supabase
            .from("conversations")
            .update({ agent_non_lu: 0 })
            .eq("id", conversationId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: conversationId,
          contenu: newMessage.trim(),
        }),
      });

      if (res.ok) {
        setNewMessage("");
      }
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 border-2 border-[#b8963e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const visitorName = conversation?.visitor?.nom_agence || "Visiteur";

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white rounded-t-2xl">
        <button
          onClick={() => router.push("/dashboard/messages")}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-[#0c1b2a]" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {conversation?.visitor?.logo_url ? (
            <img
              src={conversation.visitor.logo_url}
              alt={visitorName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs font-bold text-gray-500">
              {visitorName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#0c1b2a] truncate">
            {visitorName}
          </p>
          {conversation?.listing && (
            <p className="text-xs text-[#b8963e] truncate">
              {conversation.listing.titre}
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#fafbfc]">
        {messages.map((msg) => {
          const isMe = msg.sender_id === userId;
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  isMe
                    ? "bg-[#0c1b2a] text-white"
                    : "bg-white border border-gray-200 text-[#0c1b2a]"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">
                  {msg.contenu}
                </p>
                <p
                  className={`text-[10px] mt-1 ${
                    isMe ? "text-gray-400" : "text-gray-400"
                  }`}
                >
                  {new Date(msg.created_at).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 px-4 py-3 border-t border-gray-200 bg-white rounded-b-2xl"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Écrivez votre message..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-[#0c1b2a] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#b8963e]/30 focus:border-[#b8963e]"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="p-2.5 rounded-xl bg-[#b8963e] text-white hover:bg-[#a6852f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
