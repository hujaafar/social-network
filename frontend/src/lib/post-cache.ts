import { apiUrl } from "@/lib/api";

export function isPostFeed(key: unknown): key is string {
  return typeof key === "string" && key.startsWith(apiUrl("/posts/all"));
}
