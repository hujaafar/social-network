"use client";
import { API_ORIGIN } from "@/lib/api";


import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatSocket } from "@/lib/ChatSocketProvider";
import type { ChatMessage } from "@/types/chat";

interface MessageListProps {
  currentUserId: string;
  userId: string;
}

export function MessageList({ currentUserId, userId }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [historyMessages, setHistoryMessages] = useState<ChatMessage[]>([]);
  const [historyError, setHistoryError] = useState(false);
  const { messages: socketMessages } = useChatSocket();

  useEffect(() => {
    const controller = new AbortController();
    setHistoryMessages([]);
    setHistoryError(false);
    const fetchMessages = async () => {
      try {
        const res = await axios.get<ChatMessage[]>(
          `${API_ORIGIN}/chat/history?with=${userId}`,
          { withCredentials: true, signal: controller.signal }
        );
        setHistoryMessages(res.data ?? []);
      } catch (error) {
        if (axios.isCancel(error)) return;
        setHistoryError(true);
        setHistoryMessages([]);
      }
    };
    fetchMessages();
    return () => controller.abort();
  }, [userId]);

  // Filter socket messages relevant to this conversation.
  const mergedMessages = useMemo(() => {
  const filteredSocketMessages = socketMessages.filter(
    (msg) =>
      (msg.sender_id === currentUserId && msg.receiver_id === userId) ||
      (msg.sender_id === userId && msg.receiver_id === currentUserId)
  );

  // ✅ Fix: Prevent duplicates by only adding WebSocket messages that are NOT in history
  const messageMap = new Map(historyMessages.map((msg) => [msg.id, msg]));

  return [
    ...historyMessages,
    ...filteredSocketMessages.filter((msg) => !messageMap.has(msg.id)), // Only add new messages
  ].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  }, [historyMessages, socketMessages, currentUserId, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "nearest", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [mergedMessages]);

  return (
    <ScrollArea className="flex-1 min-h-0 p-6" aria-label="Message history">
      {historyError && <p role="alert" className="inline-error mb-4">Message history could not be loaded. Reopen this conversation to retry.</p>}
      {mergedMessages.length === 0 ? (
        <p className="text-center text-gray-400">
          No messages yet. Start the conversation!
        </p>
      ) : (
        mergedMessages.map((message, i) => (
          <div
            key={message.id || i} // Use message ID if available
            className={`flex mb-4 ${
              message.sender_id === currentUserId
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`p-3 rounded-2xl max-w-xs ${
                message.sender_id === currentUserId
                  ? "bg-[#bc4312] text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <p className="text-sm message-bubble">{message.message}</p>
              <p className="text-xs mt-1 opacity-70">
                {new Date(message.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </ScrollArea>
  );
}
