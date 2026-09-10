import useSWR from "swr";
import { apiUrl } from "@/lib/api";
import { fetcher } from "@/lib/hooks/swr/fetcher";
import { useEffect, useState } from "react";
export function useSearch(query: string) {
  const normalized = query.trim();
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(normalized), 250);
    return () => clearTimeout(timer);
  }, [normalized]);
  const { data, error, isLoading } = useSWR(
    normalized && normalized === debounced
      ? apiUrl(`/search?query=${encodeURIComponent(debounced)}`)
      : null,
    fetcher,
  );
  return {
    searchResults: normalized === debounced ? data : undefined,
    isLoading,
    isError: error,
    isWaiting: normalized !== debounced && normalized.length > 0,
  };
}
