"use client";
import { MessageCircle } from "lucide-react";
import type { User } from "@/types/chat";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
export function ChatWindow({ currentUserId, user }: { currentUserId: string; user: User | null }) {
  if (!user) return <div className="conversation-empty"><MessageCircle size={44} strokeWidth={1.2} /><h2>A simple hello<br />goes a long way.</h2><p>Choose someone from your people<br />and pick up the conversation.</p></div>;
  return <div className="chat-window"><ChatHeader user={user} /><MessageList currentUserId={currentUserId} userId={user.id} /><ChatInput currentUserId={currentUserId} userId={user.id} /></div>;
}
