import { apiUrl } from "@/lib/api";
import useSWR from 'swr';

import { fetcher } from '@/lib/hooks/swr/fetcher';

export function usePosts() {
  const { data, error, isLoading, mutate } = useSWR(apiUrl('/posts/all'), fetcher);

  return {
    posts: data || [],
    isLoading,
    isError: !!error,
    refreshPosts: mutate, // To manually refresh the data
  };
}