"use client";
import { useState, useEffect } from "react";
import {
  Home,
  Users,
  Settings,
  MessageCircle,
  LogOut,
  Asterisk,
  ArrowUpRight,
  Bell,
  Bookmark,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
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
  useEffect(() => {
    setUserId(Cookies.get("user_id"));
  }, []);
  const { user, isLoading } = useUserProfile(userId);
  const menuItems = [
    { icon: Home, label: "Your feed", href: "/" },
    { icon: Users, label: "Circles", href: "/groups" },
    { icon: Bookmark, label: "Saved posts", href: "/saved" },
    { icon: MessageCircle, label: "Messages", href: "/chat" },
    { icon: Bell, label: "Notifications", href: "/notifications" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];
  return (
    <aside className={`app-sidebar ${isOpen ? "sidebar-mobile" : ""}`}>
      <Link href="/" className="wordmark" onClick={onClose}>
        common
        <Asterisk aria-hidden="true" />
      </Link>
      <span className="sidebar-caption">
        <span /> YOUR WORLD, A LITTLE CLOSER.
      </span>
      <nav aria-label="Main navigation">
        <span className="eyebrow nav-label">YOUR SPACE</span>
        {menuItems.map((item, index) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              href={item.href}
              key={item.href}
              onClick={onClose}
              className={`nav-item ${active ? "active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <item.icon size={20} strokeWidth={1.7} />
              <span>{item.label}</span>
              <span className="nav-index" aria-hidden="true">
                0{index + 1}
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="sidebar-note">
        <div className="sidebar-photo">
          <Image src="/images/common-afterhours.webp" alt="" fill sizes="210px" />
        </div>
        <span className="eyebrow">THERE’S A PLACE FOR YOU.</span>
        <p>
          FIND YOUR
          <br />
          <em>COMMON GROUND.</em>
        </p>
        <Link href="/groups" onClick={onClose}>
          Explore circles <ArrowUpRight size={16} />
        </Link>
      </div>
      <div className="sidebar-account">
        <Link
          href={userId ? `/profile/${userId}` : "/settings"}
          className="account-profile"
          onClick={onClose}
        >
          <Avatar>
            <AvatarImage
              src={user?.avatar ? apiUrl(`/avatars/${user.avatar}`) : "/profile.png"}
              alt=""
            />
            <AvatarFallback>{user?.nickname?.charAt(0) || "C"}</AvatarFallback>
          </Avatar>
          <div>
            <strong>{isLoading ? "Loading…" : user?.nickname || "Your account"}</strong>
            <span>View your profile</span>
          </div>
        </Link>
        <button className="icon-button" aria-label="Sign out" onClick={() => handleLogout(router)}>
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
