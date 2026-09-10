"use client";

import { useRef, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { Bookmark, LoaderCircle } from "lucide-react";
import { useWorkspace } from "@/components/design/workspace-tools";
import { apiUrl } from "@/lib/api";
import { fetcher } from "@/lib/hooks/swr/fetcher";
import { isPostFeed } from "@/lib/post-cache";
import { Post } from "@/types/post";

const savedKey = apiUrl("/posts/all?feed=saved");

export function SavePostButton({ post }: { post: Post }) {
  const { data } = useSWR<Post[]>(savedKey, fetcher);
  const { mutate } = useSWRConfig();
  const { notify } = useWorkspace();
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  const saved = data ? data.some((item) => item.id === post.id) : Boolean(post.is_saved);
  async function toggle() {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    try {
      const response = await fetch(apiUrl(`/posts/save?post_id=${encodeURIComponent(post.id)}`), {
        method: saved ? "DELETE" : "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error();
      await mutate(
        savedKey,
        (current: Post[] | undefined) =>
          saved
            ? (current || []).filter((item) => item.id !== post.id)
            : [
                { ...post, is_saved: true },
                ...(current || []).filter((item) => item.id !== post.id),
              ],
        { revalidate: false },
      );
      await mutate(
        (key) => isPostFeed(key) && key !== savedKey,
        (current: Post[] | undefined) =>
          current?.map((item) => (item.id === post.id ? { ...item, is_saved: !saved } : item)),
        { revalidate: false },
      );
      void mutate(savedKey);
      notify({
        message: saved ? "Removed from your saved posts." : "Saved to your personal collection.",
      });
    } catch {
      notify({ message: "That update didn’t go through. Please try again.", tone: "error" });
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  return (
    <button
      className={`post-save-button ${saved ? "is-saved" : ""}`}
      aria-label={saved ? "Remove from saved posts" : "Save post"}
      aria-pressed={saved}
      title={saved ? "Remove saved post" : "Save for later"}
      onClick={toggle}
      disabled={pending}
    >
      {pending ? (
        <LoaderCircle size={18} className="animate-spin" />
      ) : (
        <Bookmark size={19} fill={saved ? "currentColor" : "none"} />
      )}
    </button>
  );
}
