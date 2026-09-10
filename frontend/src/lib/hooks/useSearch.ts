import useSWR from "swr";
import { apiUrl } from "@/lib/api";
import { fetcher } from "@/lib/hooks/swr/fetcher";
export function useSearch(query: string) {
  const { data, error, isLoading } = useSWR(query ? apiUrl(`/search?query=${encodeURIComponent(query)}`) : null, fetcher);
  return { searchResults: data, isLoading, isError: error };
}

