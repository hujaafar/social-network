"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Check, Plus, Search, X } from "lucide-react";
import { useSWRConfig } from "swr";
import { CreatePostPopup } from "@/components/home/posts/CreatePostPopup";
import { CommandSearch } from "@/components/design/command-search";
import { isPostFeed } from "@/lib/post-cache";
import { useDialogFocus } from "@/lib/hooks/useDialogFocus";

type Notice = { message: string; tone?: "success" | "error" };
type Tools = { openComposer: () => void; openSearch: () => void; notify: (notice: Notice) => void };
const WorkspaceContext = createContext<Tools | null>(null);

export function useWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error("Workspace tools require an authenticated workspace.");
  return value;
}

export function WorkspaceTools({ children }: { children: React.ReactNode }) {
  const [composerOpen, setComposerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { mutate } = useSWRConfig();
  const { rememberFocus: rememberComposerFocus, restoreFocus: restoreComposerFocus } =
    useDialogFocus();
  const { rememberFocus: rememberSearchFocus, restoreFocus: restoreSearchFocus } = useDialogFocus();
  const openComposer = useCallback(() => {
    rememberComposerFocus();
    setComposerOpen(true);
  }, [rememberComposerFocus]);
  const changeSearch = useCallback(
    (open: boolean) => {
      if (open) rememberSearchFocus();
      setSearchOpen(open);
    },
    [rememberSearchFocus],
  );
  const notify = useCallback((next: Notice) => {
    setNotice(next);
    if (timer.current) clearTimeout(timer.current);
    // Errors stay visible until dismissed; successful updates expire without stealing focus.
    timer.current = next.tone === "error" ? null : setTimeout(() => setNotice(null), 6000);
  }, []);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (!composerOpen && !event.repeat) changeSearch(!searchOpen);
      }
    }
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, [composerOpen, searchOpen, changeSearch]);
  return (
    <WorkspaceContext.Provider
      value={{
        openComposer,
        openSearch: () => changeSearch(true),
        notify,
      }}
    >
      {children}
      <CreatePostPopup
        isOpen={composerOpen}
        onClose={() => setComposerOpen(false)}
        onCloseAutoFocus={restoreComposerFocus}
        onCreatePost={() => {
          void mutate(isPostFeed);
          notify({ message: "Your moment is shared." });
        }}
      />
      <CommandSearch
        open={searchOpen}
        onOpenChange={changeSearch}
        onCloseAutoFocus={restoreSearchFocus}
      />
      {notice && (
        <div
          className={`workspace-notice ${notice.tone === "error" ? "notice-error" : ""}`}
          role={notice.tone === "error" ? "alert" : "status"}
        >
          {notice.tone === "error" ? <span className="notice-symbol">!</span> : <Check size={18} />}
          <span>{notice.message}</span>
          <button
            className="icon-button"
            aria-label="Dismiss message"
            onClick={() => setNotice(null)}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </WorkspaceContext.Provider>
  );
}

export function WorkspaceActions() {
  const { openSearch, openComposer } = useWorkspace();
  return (
    <>
      <button
        className="workspace-search-button"
        onClick={openSearch}
        aria-label="Search Common, Control or Command K"
      >
        <Search size={18} />
        <span>Search anything</span>
        <kbd>Ctrl / ⌘ K</kbd>
      </button>
      <button className="workspace-create-button" onClick={openComposer} aria-label="Create a post">
        <Plus size={19} />
        <span>Create</span>
      </button>
    </>
  );
}
