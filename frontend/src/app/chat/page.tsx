"use client";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { UserList } from "@/components/chat/UserList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { useChatSocket } from "@/lib/ChatSocketProvider";
import type { User } from "@/types/chat";
import Cookies from "js-cookie";
import { apiUrl, socketUrl } from "@/lib/api";
export default function ChatPage() {
  const currentUserId = Cookies.get("user_id") || "";
  const [selected, setSelected] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const { connected } = useChatSocket();
  const [directoryReady, setDirectoryReady] = useState(false);
  useEffect(() => {
    let disposed = false;
    let socket: WebSocket;
    let timer: ReturnType<typeof setTimeout>;
    function connect() {
      if (disposed) return;
      socket = new WebSocket(socketUrl("/ws/online"));
      socket.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          if (!Array.isArray(data)) return;
          setUsers(data.filter(u => u.id !== currentUserId).map(u => ({ id: u.id, name: u.nickname || "Community member", avatar: u.avatar ? apiUrl(`/avatars/${u.avatar}`) : "/profile.png", online: u.online })));
          setDirectoryReady(true);
        } catch { /* Ignore non-directory frames. */ }
      };
      socket.onerror = () => socket.close();
      socket.onclose = () => { if (!disposed) timer = setTimeout(connect, 4000); };
    }
    connect();
    return () => { disposed = true; clearTimeout(timer); socket?.close(); };
  }, [currentUserId]);
  return <div className="page-wrap messages-page">
    <header className="page-intro"><div><span className="eyebrow">SAY A LITTLE MORE</span><h1 className="page-title">Good <em>conversations.</em></h1></div><span className="connection-status"><span className={connected ? "connected" : ""} />{connected ? "Connected" : "Connecting…"}</span></header>
    <div className={`messenger ${selected ? "conversation-open" : ""}`}>
      <UserList users={users} onSelectUser={setSelected} selectedUser={selected} loading={!directoryReady} />
      <div className="conversation-panel">{selected && <button className="back-to-chats" onClick={() => setSelected(null)}><ArrowLeft size={17} /> All conversations</button>}<ChatWindow currentUserId={currentUserId} user={selected ? users.find(u => u.id === selected.id) || selected : null} /></div>
    </div>
  </div>;
}
