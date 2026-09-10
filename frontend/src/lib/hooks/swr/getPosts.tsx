import { apiUrl } from "@/lib/api";
import useSWR from "swr";

import { fetcher } from "@/lib/hooks/swr/fetcher";

export function usePosts(feed: "all" | "following" | "saved" = "all") {
  const { data, error, isLoading, mutate } = useSWR(
    apiUrl(feed === "all" ? "/posts/all" : `/posts/all?feed=${feed}`),
    fetcher,
  );

  return {
    posts: data || [],
    isLoading,
    isError: !!error,
    refreshPosts: mutate, // To manually refresh the data
  };
}
