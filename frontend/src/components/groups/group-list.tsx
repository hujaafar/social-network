import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, ArrowUpRight, Clock3 } from "lucide-react";
import { Group } from "@/types/groupTypes";
import { useEffect } from "react";
interface Props { groups: Group[]; type: "discover" | "joined"; isLoading: boolean; requestToJoin: (id: string) => void; enterGroupChat: (id: string) => void; pending: string | null; }
export function GroupList({ groups, type, isLoading, requestToJoin, enterGroupChat, pending }: Props) {
  useEffect(() => {
    if (isLoading || !window.location.hash) return;
    const id = decodeURIComponent(window.location.hash.slice(1));
    document.getElementById(id)?.scrollIntoView({ block: "center" });
  }, [isLoading, groups]);
  if (isLoading) return <div className="circle-grid" aria-label="Loading circles">{[0,1,2].map(i => <Skeleton key={i} className="h-60 w-full" />)}</div>;
  if (!groups.length) return <div className="empty-state"><Users size={32} /><h3>{type === "joined" ? "Your people are out there." : "Make room for something new."}</h3><p>{type === "joined" ? "Discover a circle and request to join the conversation." : "Try another search, or create the first circle around your interest."}</p></div>;
  return <div className="circle-grid">{groups.map((group, index) => <article key={group.id} id={group.id} className={`circle-card circle-tone-${index % 3}`}>
    <div className="circle-monogram"><span>{group.name.slice(0,2).toUpperCase()}</span><Users size={22} aria-hidden="true" /></div>
    <div className="circle-card-body"><span className="eyebrow">COMMON INTERESTS</span><h2>{group.name}</h2><p>{group.description}</p>
      {group.user_status === "member" || type === "joined" ? <Button variant="outline" onClick={() => enterGroupChat(group.id)}>Open circle <ArrowUpRight size={16} /></Button>
      : group.user_status === "pending_request" ? <Button variant="outline" disabled><Clock3 size={15} /> Request sent</Button>
      : group.user_status === "pending_invite" ? <a className="circle-invite" href="/notifications">Review invitation <ArrowUpRight size={16} /></a>
      : <Button disabled={pending !== null} onClick={() => requestToJoin(group.id)}>{pending === group.id ? "Sending…" : "Request to join"}<ArrowUpRight size={16} /></Button>}
    </div>
  </article>)}</div>;
}

