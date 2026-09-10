"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Bookmark,
  CornerDownLeft,
  Home,
  MessageCircle,
  Search,
  Settings,
  Users,
  UserRound,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useSearch } from "@/lib/hooks/useSearch";
import { User } from "@/types/user";
import { Group } from "@/types/groupTypes";

const destinations = [
  { id: "feed", label: "Your feed", detail: "Latest moments", href: "/", icon: Home },
  {
    id: "saved",
    label: "Saved posts",
    detail: "Your personal collection",
    href: "/saved",
    icon: Bookmark,
  },
  { id: "circles", label: "Circles", detail: "Find your people", href: "/groups", icon: Users },
  {
    id: "messages",
    label: "Messages",
    detail: "Pick up a conversation",
    href: "/chat",
    icon: MessageCircle,
  },
  {
    id: "settings",
    label: "Settings",
    detail: "Your account and privacy",
    href: "/settings",
    icon: Settings,
  },
];

export function CommandSearch({
  open,
  onOpenChange,
  onCloseAutoFocus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus: (event: Event) => void;
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { searchResults, isLoading, isError, isWaiting } = useSearch(open ? query : "");
  const entries = useMemo(() => {
    const pages = destinations.filter((page) =>
      `${page.label} ${page.detail}`.toLowerCase().includes(query.trim().toLowerCase()),
    );
    const people = (searchResults?.users || []).map((user: User) => ({
      id: `person-${user.id}`,
      label: user.nickname || `${user.first_name} ${user.last_name}`,
      detail: "Person",
      href: `/profile/${user.id}`,
      icon: UserRound,
    }));
    const circles = (searchResults?.groups || []).map((group: Group) => ({
      id: `circle-${group.id}`,
      label: group.name,
      detail: "Circle",
      href: `/groups#${group.id}`,
      icon: Users,
    }));
    return [...pages, ...people, ...circles].slice(0, 18);
  }, [query, searchResults]);
  const selected = Math.min(active, Math.max(0, entries.length - 1));
  function choose(href: string) {
    onOpenChange(false);
    setQuery("");
    setActive(0);
    router.push(href);
  }
  useEffect(() => {
    document.getElementById(`command-option-${selected}`)?.scrollIntoView({ block: "nearest" });
  }, [selected]);
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          setQuery("");
          setActive(0);
        }
      }}
    >
      <DialogContent
        className="command-dialog"
        onCloseAutoFocus={onCloseAutoFocus}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          input.current?.focus();
        }}
      >
        <DialogTitle className="sr-only">Search Common</DialogTitle>
        <DialogDescription className="sr-only">
          Find people, circles or a page. Use arrow keys to move and Enter to open a result.
        </DialogDescription>
        <div className="command-input">
          <Search size={23} />
          <Input
            ref={input}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            placeholder="People, circles, your next conversation…"
            role="combobox"
            aria-label="Search Common"
            aria-expanded="true"
            aria-controls="command-results"
            aria-autocomplete="list"
            aria-activedescendant={entries.length ? `command-option-${selected}` : undefined}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActive(entries.length ? (selected + 1) % entries.length : 0);
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setActive(entries.length ? (selected - 1 + entries.length) % entries.length : 0);
              }
              if (event.key === "Enter" && entries[selected]) {
                event.preventDefault();
                choose(entries[selected].href);
              }
            }}
          />
        </div>
        <div className="command-section-label">
          <span>{query.trim() ? "RESULTS" : "JUMP TO"}</span>
          <span aria-live="polite">
            {isLoading || isWaiting ? "Searching…" : `${entries.length} destinations`}
          </span>
        </div>
        <div
          id="command-results"
          className="command-results"
          role="listbox"
          aria-label="Search results"
        >
          {entries.map((entry, index) => (
            <div
              role="option"
              aria-selected={index === selected}
              id={`command-option-${index}`}
              key={entry.id}
              className={`command-option ${selected === index ? "selected" : ""}`}
              onPointerMove={() => setActive(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(entry.href)}
            >
              <span className="command-result-icon">
                <entry.icon size={20} />
              </span>
              <span>
                <strong>{entry.label}</strong>
                <small>{entry.detail}</small>
              </span>
              <ArrowUpRight size={18} />
            </div>
          ))}
        </div>
        {isError && (
          <p className="command-message" role="alert">
            People and circles are unavailable right now. You can still open a page.
          </p>
        )}
        {!entries.length && !isLoading && !isWaiting && !isError && (
          <p className="command-message">No matches yet. Try another name or interest.</p>
        )}
        <footer className="command-footer">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> to navigate
          </span>
          <span>
            <CornerDownLeft size={14} /> to open
          </span>
          <span>
            <kbd>esc</kbd> to close
          </span>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
