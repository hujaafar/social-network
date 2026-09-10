"use client";
import { useState, useEffect, useCallback } from "react";
import { fetcher } from "@/lib/hooks/swr/fetcher";
import { apiUrl } from "@/lib/api";
import { Group } from "@/types/groupTypes";
export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [joinedGroups, setJoinedGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const refreshGroups = useCallback(async () => {
    setError("");
    try {
      const [all, joined] = await Promise.all([fetcher(apiUrl("/groups")), fetcher(apiUrl("/groups/user"))]);
      setGroups(Array.isArray(all) ? all : []); setJoinedGroups(Array.isArray(joined) ? joined : []);
    } catch { setError("We couldn’t load the circles. Please try again."); }
    finally { setIsLoading(false); }
  }, []);
  useEffect(() => { refreshGroups(); }, [refreshGroups]);
  return { groups, joinedGroups, isLoading, error, refreshGroups, refreshJoinedGroups: refreshGroups };
}
