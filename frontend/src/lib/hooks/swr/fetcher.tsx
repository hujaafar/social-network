export async function fetcher(url: string) {
  const response = await fetch(url, { credentials: "include" });
  if (!response.ok) {
    // An expired session should never be rendered as an empty feed or a successful search.
    if (response.status === 401 && typeof window !== "undefined") window.location.assign("/login");
    throw new Error(`Request failed (${response.status})`);
  }
  return response.json();
}
