"use client";
/* eslint-disable @next/next/no-img-element -- User uploads and blob previews preserve native GIF playback without proxying private media. */
import { useEffect, useRef, useState } from "react";
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
import { imageFileError } from "@/lib/image-file";
export function CreatePostPopup({
  isOpen,
  onClose,
  onCreatePost,
  onCloseAutoFocus,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreatePost: () => void;
  onCloseAutoFocus: (event: Event) => void;
}) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [dragging, setDragging] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const busy = useRef(false);
  const characterCount = Array.from(content).length;
  function attach(file?: File) {
    if (!file || busy.current) return;
    const validation = imageFileError(file);
    setError(validation || "");
    if (!validation) setImage(file);
  }
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
    if (!content.trim() || busy.current || characterCount > 500) return;
    busy.current = true;
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
      busy.current = false;
      setPending(false);
    }
  }
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !pending) {
          setDragging(false);
          onClose();
        }
      }}
    >
      <DialogContent
        className="post-compose-dialog"
        onCloseAutoFocus={onCloseAutoFocus}
        onDragOver={(event) => {
          if (event.dataTransfer.types.includes("Files")) {
            event.preventDefault();
            setDragging(true);
          }
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          attach(event.dataTransfer.files[0]);
        }}
      >
        {dragging && (
          <div className="compose-drop-overlay" aria-hidden="true">
            <ImagePlus size={40} />
            <strong>Drop a little of your world.</strong>
            <span>JPG, PNG or GIF · up to 10 MB</span>
          </div>
        )}
        <DialogHeader>
          <span className="eyebrow">A LITTLE OF YOUR EVERYDAY</span>
          <DialogTitle>Share a moment.</DialogTitle>
          <DialogDescription>Big ideas, small updates. Make it your own.</DialogDescription>
        </DialogHeader>
        <form
          ref={formRef}
          onSubmit={submit}
          className="post-compose-form"
          onKeyDown={(event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
              event.preventDefault();
              formRef.current?.requestSubmit();
            }
          }}
        >
          <Label htmlFor="post-content" className="sr-only">
            Your post
          </Label>
          <Textarea
            id="post-content"
            placeholder="What’s on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            aria-describedby="compose-counter"
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
                  attach(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
            <span id="compose-counter" className={characterCount > 500 ? "inline-error" : ""}>
              {characterCount}/500
            </span>
          </div>
          {preview && (
            <div className="attachment-preview">
              <img src={preview} alt="Photo to share" />
              <button
                type="button"
                className="icon-button"
                aria-label="Remove photo"
                disabled={pending}
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
                      disabled={pending}
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
          <p className="compose-draft-note">
            Your draft stays here while you browse. <span>Ctrl / ⌘ + Enter to share</span>
          </p>
          <DialogFooter>
            <Button
              type="submit"
              className="auth-submit"
              disabled={pending || !content.trim() || characterCount > 500}
            >
              {pending ? "Sharing…" : "Share your moment"}
              <ArrowUpRight size={18} />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
