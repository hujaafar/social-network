"use client";
import { useCallback, useEffect, useState } from "react";
import { Bell, CheckCheck, Users, Check, X, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { apiUrl } from "@/lib/api";
import { useSWRConfig } from "swr";
interface Notification {
  id: string; type: string; content: string; related_user_id?: string; group_id?: string;
  read: boolean; created_at: string; sender_avatar?: string;
}
export function RightSidebar({ isOpen }: { isOpen: boolean; onClose: () => void }) {
  const { mutate } = useSWRConfig();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const load = useCallback(async () => {
    try {
      const response = await fetch(apiUrl("/notifications/get"), { credentials: "include" });
      if (!response.ok) throw new Error("Could not load");
      const data = await response.json(); setItems(Array.isArray(data) ? data : []); setError("");
      mutate(apiUrl("/notifications/get"), data, false);
    } catch { setError("We couldn’t load your activity. Try again in a moment."); }
    finally { setLoading(false); }
  }, [mutate]);
  useEffect(() => {
    if (!isOpen) return;
    load();
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, [isOpen, load]);
  async function request(path: string, body?: object) {
    const res = await fetch(apiUrl(path), { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    if (!res.ok) throw new Error("Request failed");
  }
  async function respond(item: Notification, action: "accept" | "decline") {
    setPending(item.id); setError("");
    try {
      if (item.type === "follow_request") await request("/follow/request", { follower_id: item.related_user_id, action });
      else if (item.type === "group_join_request") await request("/groups/join/respond", { group_id: item.group_id, user_id: item.related_user_id, action });
      else await request("/groups/invite/respond", { group_id: item.group_id, action });
      await load();
    } catch { setError("That update didn’t go through. Please try again."); }
    finally { setPending(null); }
  }
  async function markRead(id?: string) {
    setPending(id || "all");
    try {
      await request(id ? `/notifications/read?id=${encodeURIComponent(id)}` : "/notifications/read-all");
      setItems(prev => prev.map(item => !id || item.id === id ? { ...item, read: true } : item));
      mutate(apiUrl("/notifications/get"));
    } catch { setError("We couldn’t mark the notification as read."); }
    finally { setPending(null); }
  }
  const unread = items.filter(item => !item.read).length;
  return <section className="activity-panel" aria-label="Notifications">
    <span className="eyebrow">KEEPING YOU IN THE LOOP</span><h2>Your activity<span>.</span></h2>
    <div className="activity-toolbar"><span>{unread ? `${unread} unread` : "You’re all caught up"}</span><button disabled={!unread || pending !== null} onClick={() => markRead()}><CheckCheck size={16} /> Mark all read</button></div>
    {error && <div className="inline-error" role="alert">{error}<button className="block underline mt-2" onClick={load}>Try again</button></div>}
    {loading ? <p className="inline-note">Checking your activity…</p> : !items.length && !error ? <div className="empty-state"><Bell size={32} /><h3>Quiet, in a good way.</h3><p>Follow requests, circle invitations and event updates will appear here.</p><Link href="/groups">Explore circles <ArrowUpRight size={16} /></Link></div> : <ul className="activity-list">
      {items.map(item => <li key={item.id} className={item.read ? "" : "unread"}>
        <div className="activity-icon"><Users size={18} /></div>
        <div className="activity-item-body"><p>{item.content}</p><time dateTime={item.created_at}>{new Date(item.created_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</time>
          {["follow_request", "group_join_request", "group_invite"].includes(item.type) ? <div className="activity-item-actions"><Button size="sm" disabled={pending !== null} onClick={() => respond(item, "accept")}><Check size={15} /> Accept</Button><Button size="sm" variant="outline" disabled={pending !== null} onClick={() => respond(item, "decline")}><X size={15} /> Decline</Button></div> : !item.read && <button className="mark-read" disabled={pending !== null} onClick={() => markRead(item.id)}>Mark as read</button>}
        </div>
      </li>)}
    </ul>}
  </section>;
}
