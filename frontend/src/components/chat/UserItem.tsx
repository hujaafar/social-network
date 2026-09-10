"use client";
import type { User } from "@/types/chat";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
export function UserItem({ user, onClick, isSelected }: { user: User; onClick: () => void; isSelected: boolean }) {
  return <button className={`conversation-contact ${isSelected ? "selected" : ""}`} onClick={onClick} aria-pressed={isSelected}>
    <Avatar><AvatarImage src={user.avatar} alt="" /><AvatarFallback>{user.name.slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
    <span><strong>{user.name}</strong><small>{user.online ? "Online now" : "Offline"}</small></span><span className={`presence-dot ${user.online ? "online" : ""}`} />
  </button>;
}

