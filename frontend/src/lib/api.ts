/** One backend origin for requests, uploads and sockets in every deployment. */
export const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(
  /\/$/,
  "",
);
export function apiUrl(path: string): string {
  return `${API_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}
export function socketUrl(path: string): string {
  return apiUrl(path).replace(/^http/, "ws");
}
