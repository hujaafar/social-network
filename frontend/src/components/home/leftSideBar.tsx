"use client";
import { useState, useEffect } from "react";
import { Home, Users, Settings, MessageCircle, LogOut, Asterisk, ArrowUpRight, Bell } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { handleLogout } from "@/lib/functions/logout";
import { useRouter, usePathname } from "next/navigation";
import { useUserProfile } from "@/lib/hooks/swr/getUserProfile";
import { apiUrl } from "@/lib/api";
import Cookies from "js-cookie";
export function LeftSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const [userId, setUserId] = useState<string | undefined>();
  useEffect(() => { setUserId(Cookies.get("user_id")); }, []);
  const { user, isLoading } = useUserProfile(userId);
  const menuItems = [
    { icon: Home, label: "Your feed", href: "/" },
    { icon: Users, label: "Circles", href: "/groups" },
    { icon: MessageCircle, label: "Messages", href: "/chat" },
    { icon: Bell, label: "Notifications", href: "/notifications" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];
  return <aside className={`app-sidebar ${isOpen ? "sidebar-mobile" : ""}`}>
    <Link href="/" className="wordmark" onClick={onClose}>common<Asterisk aria-hidden="true" /></Link>
    <span className="sidebar-caption">GOOD TO HAVE YOU HERE.</span>
    <nav aria-label="Main navigation"><span className="eyebrow nav-label">YOUR SPACE</span>
      {menuItems.map(item => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return <Link href={item.href} key={item.href} onClick={onClose} className={`nav-item ${active ? "active" : ""}`} aria-current={active ? "page" : undefined}>
          <item.icon size={20} strokeWidth={1.7} /><span>{item.label}</span>{active && <span className="nav-dot" />}
        </Link>;
      })}
    </nav>
    <div className="sidebar-note"><Asterisk size={36} aria-hidden="true" /><p>Small moments.<br /><em>Real connections.</em></p><Link href="/groups" onClick={onClose}>Find your circle <ArrowUpRight size={16} /></Link></div>
    <div className="sidebar-account">
      <Link href={userId ? `/profile/${userId}` : "/settings"} className="account-profile" onClick={onClose}>
        <Avatar><AvatarImage src={user?.avatar ? apiUrl(`/avatars/${user.avatar}`) : "/profile.png"} alt="" /><AvatarFallback>{user?.nickname?.charAt(0) || "C"}</AvatarFallback></Avatar>
        <div><strong>{isLoading ? "Loading…" : user?.nickname || "Your account"}</strong><span>View your profile</span></div>
      </Link>
      <button className="icon-button" aria-label="Sign out" onClick={() => handleLogout(router)}><LogOut size={18} /></button>
    </div>
  </aside>;
}
