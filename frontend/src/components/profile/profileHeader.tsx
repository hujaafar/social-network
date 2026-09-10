"use client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CalendarDays, LockKeyhole, Globe2, ArrowUpRight } from "lucide-react";
import { EditorialImage } from "@/components/design/editorial-image";
import { useState } from "react";
import { useSWRConfig } from "swr";
import axios from "axios";
import Link from "next/link";
import { User } from "@/types/user";
import { apiUrl } from "@/lib/api";
export default function ProfileHeader({ user }: { user: User }) {
  const { mutate } = useSWRConfig();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function follow() {
    if (pending) return; setPending(true); setError("");
    try {
      if (user.is_following) await axios.delete(apiUrl("/unfollow"), { data: { followed_id: user.id }, withCredentials: true });
      else await axios.post(apiUrl("/follow"), { followed_id: user.id }, { withCredentials: true });
      await mutate(apiUrl(`/users/profile?user_id=${user.id}`));
    } catch { setError("We couldn’t update this connection. Please try again."); }
    finally { setPending(false); }
  }
  return <section className="profile-card">
    <div className="profile-cover"><EditorialImage src="/images/common-studio.webp" alt="" /><span>A LITTLE ABOUT ME.</span></div>
    <div className="profile-details">
      <div className="profile-identity"><Avatar className="profile-avatar"><AvatarImage src={user.avatar ? apiUrl(`/avatars/${user.avatar}`) : "/profile.png"} alt="" /><AvatarFallback>{user.first_name?.[0]}{user.last_name?.[0]}</AvatarFallback></Avatar>
        {user.is_my_profile ? <Button asChild variant="outline"><Link href="/settings">Edit profile <ArrowUpRight size={16} /></Link></Button> : <Button disabled={pending || user.pending === "1"} onClick={follow}>{pending ? "Updating…" : user.is_following ? "Unfollow" : user.pending === "1" ? "Request sent" : user.private ? "Request to follow" : "Follow"}</Button>}
      </div>
      <span className="eyebrow">@{user.nickname}</span><h1>{user.first_name} {user.last_name}</h1>
      {user.about_me && <p className="profile-bio">{user.about_me}</p>}
      <div className="profile-meta"><span>{user.private ? <LockKeyhole size={15} /> : <Globe2 size={15} />}{user.private ? "Private profile" : "Public profile"}</span><span><CalendarDays size={15} />Born {new Date(user.date_of_birth + (user.date_of_birth.length === 10 ? "T12:00:00" : "")).toLocaleDateString(undefined,{month:"long",day:"numeric",year:"numeric"})}</span></div>
      <div className="profile-stats"><span><strong>{user.followers_count || 0}</strong> followers</span><span><strong>{user.following_count || 0}</strong> following</span></div>
      {error && <p role="alert" className="inline-error">{error}</p>}
    </div>
  </section>;
}
