"use client";
/* eslint-disable @next/next/no-img-element -- User uploads and blob previews preserve native GIF playback without proxying private media. */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ImagePlus, ArrowUpRight, X } from "lucide-react";
import { useFollowers } from "@/lib/hooks/swr/useFollowers";
import Cookies from "js-cookie";
import { apiUrl } from "@/lib/api";
export function CreatePostPopup({
  isOpen,
  onClose,
  onCreatePost,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreatePost: () => void;
}) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const { followers, isLoading: followersLoading } = useFollowers(Cookies.get("user_id") || "");
  useEffect(() => {
    if (!image) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || pending) return;
    setPending(true);
    setError("");
    try {
      const form = new FormData();
      form.set("content", content.trim());
      form.set("privacy", privacy);
      if (image) form.set("file", image);
      if (privacy === "private") selectedUsers.forEach((id) => form.append("allowed_users[]", id));
      const response = await fetch(apiUrl("/posts"), {
        method: "POST",
        body: form,
        credentials: "include",
      });
      if (!response.ok) throw new Error();
      onCreatePost();
      setContent("");
      setImage(null);
      setPrivacy("public");
      setSelectedUsers([]);
      onClose();
    } catch {
      setError("Your post couldn’t be shared. Your draft is still here—try again.");
    } finally {
      setPending(false);
    }
  }
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !pending) onClose();
      }}
    >
      <DialogContent className="post-compose-dialog">
        <DialogHeader>
          <span className="eyebrow">A LITTLE OF YOUR EVERYDAY</span>
          <DialogTitle>Share a moment.</DialogTitle>
          <DialogDescription>Big ideas, small updates. Make it your own.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="post-compose-form">
          <Label htmlFor="post-content" className="sr-only">
            Your post
          </Label>
          <Textarea
            id="post-content"
            placeholder="What’s on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={500}
            required
            disabled={pending}
          />
          <div className="compose-attachment">
            <label className="attachment-label">
              <ImagePlus size={18} />
              {image ? "Change photo" : "Add a photo or GIF"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif"
                className="sr-only"
                disabled={pending}
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  if (file && file.size > 10 * 1024 * 1024) {
                    setError("Choose a photo smaller than 10 MB.");
                    e.target.value = "";
                  } else {
                    setImage(file);
                    setError("");
                  }
                }}
              />
            </label>
            <span>{content.length}/500</span>
          </div>
          {preview && (
            <div className="attachment-preview">
              <img src={preview} alt="Photo to share" />
              <button
                type="button"
                className="icon-button"
                aria-label="Remove photo"
                onClick={() => setImage(null)}
              >
                <X size={17} />
              </button>
            </div>
          )}
          <div className="form-field">
            <Label htmlFor="post-audience">Who can see this?</Label>
            <Select value={privacy} onValueChange={setPrivacy} disabled={pending}>
              <SelectTrigger id="post-audience">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Everyone</SelectItem>
                <SelectItem value="almost-private">My followers</SelectItem>
                <SelectItem value="private">Selected followers</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {privacy === "private" && (
            <fieldset className="audience-picker">
              <legend>Choose your audience</legend>
              {followersLoading ? (
                <p className="inline-note">Loading your followers…</p>
              ) : followers?.length ? (
                followers.map((person: { id: string; nickname: string }) => (
                  <label key={person.id}>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(person.id)}
                      onChange={(e) =>
                        setSelectedUsers((ids) =>
                          e.target.checked
                            ? [...ids, person.id]
                            : ids.filter((id) => id !== person.id),
                        )
                      }
                    />
                    {person.nickname}
                  </label>
                ))
              ) : (
                <p className="inline-note">
                  You don’t have followers yet. This post will be visible only to you.
                </p>
              )}
            </fieldset>
          )}
          {error && (
            <p role="alert" className="inline-error">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button type="submit" className="auth-submit" disabled={pending || !content.trim()}>
              {pending ? "Sharing…" : "Share your moment"}
              <ArrowUpRight size={18} />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
