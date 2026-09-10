import { API_ORIGIN } from "@/lib/api";
import useSWR from "swr";
import { fetcher } from "@/lib/hooks/swr/fetcher";

export function useUserProfile(user_id?: string) {
  const shouldFetch = !!user_id;
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? `${API_ORIGIN}/users/profile?user_id=${user_id}` : null,
    fetcher
  );

  return {
    user: data,
    isLoading,
    isError: !!error,
    refreshUser: mutate,
  };
}
