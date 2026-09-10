"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Post } from "@/types/post";
import { PostView } from "./postView";
import { useDialogFocus } from "@/lib/hooks/useDialogFocus";

/** Keep the underlying list mounted so closing a conversation preserves your place. */
export function usePostReader() {
  const [post, setPost] = useState<Post | null>(null);
  const { rememberFocus, restoreFocus } = useDialogFocus();
  function openPost(next: Post) {
    rememberFocus();
    setPost(next);
  }
  const reader = (
    <Dialog
      open={Boolean(post)}
      onOpenChange={(open) => {
        if (!open) setPost(null);
      }}
    >
      <DialogContent
        className={`post-reader-dialog ${post?.image_url ? "reader-has-photo" : ""}`}
        onCloseAutoFocus={restoreFocus}
      >
        <DialogTitle className="sr-only">
          Conversation with {post?.nickname || "your community"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Read this post, save it, and add to the conversation.
        </DialogDescription>
        {post && <PostView key={post.id} post={post} immersive onClose={() => setPost(null)} />}
      </DialogContent>
    </Dialog>
  );
  return { openPost, reader };
}
