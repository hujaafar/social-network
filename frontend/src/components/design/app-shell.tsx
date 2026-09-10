"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, Asterisk } from "lucide-react";
import { LeftSidebar } from "@/components/home/leftSideBar";
import { RightSidebar } from "@/components/Notifications/Sidebar";
import { ChatSocketProvider } from "@/lib/ChatSocketProvider";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";
import useSWR, { SWRConfig } from "swr";
import { apiUrl } from "@/lib/api";
import { fetcher } from "@/lib/hooks/swr/fetcher";
import { WorkspaceActions, WorkspaceTools } from "@/components/design/workspace-tools";

const accountCache = { provider: () => new Map() };

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/login" || pathname === "/register") return <>{children}</>;
  // A signed-in mount owns its cache; signing out discards private data and draft state.
  return (
    <SWRConfig value={accountCache}>
      <WorkspaceShell>{children}</WorkspaceShell>
    </SWRConfig>
  );
}

function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 180, damping: 32 });
  const reduceMotion = useReducedMotion();
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const { data: activity } = useSWR(isAuthPage ? null : apiUrl("/notifications/get"), fetcher, {
    refreshInterval: 30000,
  });
  const unread = Array.isArray(activity)
    ? activity.filter((item: { read: boolean }) => !item.read).length
    : 0;
  const section =
    pathname === "/saved"
      ? "Saved posts"
      : pathname.startsWith("/groups")
        ? "Circles"
        : pathname.startsWith("/profile")
          ? "Profile"
          : pathname === "/chat"
            ? "Messages"
            : pathname === "/notifications"
              ? "Activity"
              : pathname === "/settings"
                ? "Settings"
                : "Your feed";
  if (pathname === "/login" || pathname === "/register") return <>{children}</>;
  return (
    <ChatSocketProvider>
      <WorkspaceTools>
        <div className="common-app">
          <LeftSidebar isOpen={false} onClose={() => setMenuOpen(false)} />
          <div className="app-workspace">
            <header className="app-topbar">
              <div className="topbar-left">
                <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
                  <DialogTrigger asChild>
                    <button className="icon-button mobile-menu" aria-label="Open navigation">
                      <Menu size={21} />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="navigation-dialog">
                    <DialogTitle className="sr-only">Navigation</DialogTitle>
                    <DialogDescription className="sr-only">
                      Explore Common and manage your account.
                    </DialogDescription>
                    <LeftSidebar isOpen onClose={() => setMenuOpen(false)} />
                  </DialogContent>
                </Dialog>
                <Link href="/" className="mobile-wordmark wordmark">
                  common
                  <Asterisk aria-hidden="true" />
                </Link>
                <span className="topbar-label">
                  YOUR SPACE <span aria-hidden="true">/</span> <strong>{section}</strong>
                </span>
              </div>
              <div className="topbar-actions">
                <WorkspaceActions />
                <Dialog open={activityOpen} onOpenChange={setActivityOpen}>
                  <DialogTrigger asChild>
                    <button
                      className="icon-button notification-button"
                      aria-label={`Open notifications${unread ? `, ${unread} unread` : ""}`}
                    >
                      <Bell size={20} />
                      {unread > 0 && (
                        <span className="notification-count" aria-hidden="true">
                          {unread > 9 ? "9+" : unread}
                        </span>
                      )}
                    </button>
                  </DialogTrigger>
                  <DialogContent className="activity-dialog">
                    <DialogTitle className="sr-only">Notifications</DialogTitle>
                    <DialogDescription className="sr-only">
                      Your follow requests, group invitations and event updates.
                    </DialogDescription>
                    <RightSidebar isOpen onClose={() => setActivityOpen(false)} />
                  </DialogContent>
                </Dialog>
              </div>
              <motion.div
                className="reading-progress"
                style={{ scaleX: reduceMotion ? scrollYProgress : progress }}
              />
            </header>
            <main id="main-content" className="app-main" tabIndex={-1}>
              <motion.div
                key={pathname}
                initial={false}
                animate={reduceMotion ? undefined : { opacity: [0.72, 1], y: [8, 0] }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                {children}
              </motion.div>
            </main>
            <footer className="app-footer">
              <Link href="/" className="wordmark">
                common
                <Asterisk aria-hidden="true" />
              </Link>
              <span>GOOD PEOPLE. GREAT STORIES.</span>
              <a href="#main-content">Back to top ↑</a>
            </footer>
          </div>
        </div>
      </WorkspaceTools>
    </ChatSocketProvider>
  );
}
