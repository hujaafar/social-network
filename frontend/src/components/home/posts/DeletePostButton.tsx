"use client";
import { useState } from "react";
import { useSWRConfig } from "swr";
import { Trash2 } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import { apiUrl } from "@/lib/api";
export function DeletePostButton({ postId }: { postId: string }) {
  const [pending, setPending] = useState(false);
  const { mutate } = useSWRConfig();
  async function remove() {
    const result = await Swal.fire({
      title: "Delete this post?",
      text: "This also removes its comments and reactions.",
      showCancelButton: true,
      confirmButtonColor: "#bc4312",
      confirmButtonText: "Delete post",
      cancelButtonText: "Keep it",
    });
    if (!result.isConfirmed || pending) return;
    setPending(true);
    try {
      await axios.delete(apiUrl(`/posts/delete?id=${postId}`), { withCredentials: true });
      await mutate(
        (key) =>
          typeof key === "string" && (key.includes("/posts/all") || key.includes("/users/profile")),
      );
    } catch {
      await Swal.fire("Couldn’t delete the post", "Please try again in a moment.", "error");
    } finally {
      setPending(false);
    }
  }
  return (
    <button
      type="button"
      className="icon-button text-muted-foreground"
      aria-label="Delete post"
      disabled={pending}
      onClick={remove}
    >
      <Trash2 size={16} />
    </button>
  );
}
