import { API_ORIGIN } from "@/lib/api";
import useSWR from "swr";
import { fetcher } from "@/lib/hooks/swr/fetcher";

export function useFollowers(userId?: string) {
  // If userId is provided, use it; otherwise, rely on the session's logged-in user.
  const { data, error } = useSWR(
    userId ? `${API_ORIGIN}/followers?user_id=${userId}` : `${API_ORIGIN}/followers`,
    fetcher,
  );

  return {
    followers: data, // Array of follower objects: { id, nickname, avatar }
    isLoading: !error && !data,
    isError: !!error,
  };
}
