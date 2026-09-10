"use client";
import NotificationPopup from "@/components/Notifications/notification-popup";
import Cookies from "js-cookie";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { socketUrl } from "@/lib/api";
export interface ChatMessage { id: string; sender_id: string; receiver_id: string; message: string; type: string; created_at: string; sender_name: string; }
interface Context { ws: WebSocket | null; connected: boolean; error: string; sendMessage: (msg: Omit<ChatMessage, "id" | "created_at">) => Promise<boolean>; messages: ChatMessage[]; }
const ChatSocketContext = createContext<Context | undefined>(undefined);
export function ChatSocketProvider({ children }: { children: React.ReactNode }) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [latest, setLatest] = useState<ChatMessage | null>(null);
  const [error, setError] = useState("");
  const pending = useRef<((success: boolean) => void) | null>(null);
  useEffect(() => {
    const userId = Cookies.get("user_id");
    if (!userId) return;
    let disposed = false;
    let socket: WebSocket | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    function connect() {
      if (disposed) return;
      socket = new WebSocket(socketUrl("/chat/private")); setWs(socket);
      socket.onopen = () => { if (!disposed) { setConnected(true); setError(""); } };
      socket.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          if (data.error) { setError(String(data.error)); pending.current?.(false); return; }
          if (!data.id || data.type !== "message") return;
          setMessages(prev => prev.some(m => m.id === data.id) ? prev : [...prev, data]);
          if (data.sender_id === userId) pending.current?.(true);
          else setLatest(data);
        } catch { /* Non-message protocol frames do not belong in the conversation. */ }
      };
      // Only close schedules a retry; scheduling in both error and close creates duplicate sockets.
      socket.onerror = () => { socket?.close(); };
      socket.onclose = () => {
        pending.current?.(false);
        if (!disposed) { setConnected(false); timer = setTimeout(connect, 4000); }
      };
    }
    connect();
    return () => { disposed = true; clearTimeout(timer); pending.current?.(false); socket?.close(); };
  }, []);
  function sendMessage(message: Omit<ChatMessage, "id" | "created_at">): Promise<boolean> {
    if (!ws || ws.readyState !== WebSocket.OPEN || pending.current) return Promise.resolve(false);
    setError("");
    // Wait for the server's persisted-message acknowledgement before clearing the draft.
    return new Promise(resolve => {
      const timer = setTimeout(() => { setError("Delivery could not be confirmed. Check the conversation before retrying."); pending.current?.(false); }, 10000);
      pending.current = success => { clearTimeout(timer); pending.current = null; resolve(success); };
      try { ws.send(JSON.stringify(message)); } catch { pending.current(false); }
    });
  }
  return <ChatSocketContext.Provider value={{ ws, connected, error, sendMessage, messages }}>{children}
    {latest && <NotificationPopup message={latest.message} username={latest.sender_name} onClose={() => setLatest(null)} />}
  </ChatSocketContext.Provider>;
}
export function useChatSocket() { const context = useContext(ChatSocketContext); if (!context) throw new Error("Chat provider is missing"); return context; }
