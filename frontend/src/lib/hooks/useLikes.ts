import { useRef, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { apiUrl } from "@/lib/api";
import { isPostFeed } from "@/lib/post-cache";
import { fetcher } from "@/lib/hooks/swr/fetcher";
import { useWorkspace } from "@/components/design/workspace-tools";
import { Post } from "@/types/post";

export function useLikes(initialPosts: Post[], refreshPosts?: () => void) {
  const [changes, setChanges] = useState<Record<string, { liked: boolean; count: number }>>({});
  const [pendingLikes, setPendingLikes] = useState<Record<string, boolean>>({});
  const inFlight = useRef(new Set<string>());
  const { data: feed } = useSWR<Post[]>(apiUrl("/posts/all"), fetcher);
  const { mutate } = useSWRConfig();
  const { notify } = useWorkspace();
  const source = initialPosts.map((post) => feed?.find((item) => item.id === post.id) || post);
  const likesState = Object.fromEntries(
    source.map((post) => [post.id, changes[post.id]?.liked ?? post.has_liked]),
  );
  const likesCount = Object.fromEntries(
    source.map((post) => [post.id, changes[post.id]?.count ?? post.likes_count ?? 0]),
  );

  async function handleLike(postId: string) {
    const post = source.find((item) => item.id === postId);
    if (!post || inFlight.current.has(postId)) return;
    inFlight.current.add(postId);
    const previous = changes[postId] || {
      liked: Boolean(post.has_liked),
      count: Number(post.likes_count) || 0,
    };
    const next = {
      liked: !previous.liked,
      count: Math.max(0, previous.count + (previous.liked ? -1 : 1)),
    };
    setPendingLikes((current) => ({ ...current, [postId]: true }));
    setChanges((current) => ({ ...current, [postId]: next }));
    try {
      const response = await fetch(
        apiUrl(
          `/posts/${previous.liked ? "unlike" : "like"}?post_id=${encodeURIComponent(postId)}`,
        ),
        { method: previous.liked ? "DELETE" : "POST", credentials: "include" },
      );
      if (!response.ok) throw new Error();
      await mutate(
        isPostFeed,
        (current: Post[] | undefined) =>
          current?.map((item) =>
            item.id === postId ? { ...item, has_liked: next.liked, likes_count: next.count } : item,
          ),
        { revalidate: false },
      );
      void mutate(isPostFeed);
      refreshPosts?.();
    } catch {
      notify({ message: "Your reaction couldn’t be updated. Please try again.", tone: "error" });
    } finally {
      // Shared server data takes over after the request, including failed optimistic changes.
      setChanges((current) => {
        const nextChanges = { ...current };
        delete nextChanges[postId];
        return nextChanges;
      });
      inFlight.current.delete(postId);
      setPendingLikes((current) => ({ ...current, [postId]: false }));
    }
  }
  return { likesState, likesCount, pendingLikes, handleLike };
}
