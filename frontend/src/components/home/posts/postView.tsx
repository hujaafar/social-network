"use client";
/* eslint-disable @next/next/no-img-element -- User uploads and blob previews preserve native GIF playback without proxying private media. */
import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { ArrowLeft, ImagePlus, Send, X } from "lucide-react";
import { Post } from "@/types/post";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CommentItem } from "./comment";
import PostItem from "./postItem";
import { useLikes } from "@/lib/hooks/useLikes";
import { apiUrl } from "@/lib/api";
import { fetcher } from "@/lib/hooks/swr/fetcher";
export interface Comment { id: string; user_id: string; avatar?: string; nickname?: string; content: string; created_at: string; image_url?: string; }
interface Props { post: Post; onClose: () => void; handleLike?: (postId: number) => Promise<void>; likesState: { [key: number]: boolean }; likesCount: { [key: number]: number }; }
export function PostView({ post, onClose }: Props) {
  const { data, error: loadError, isLoading, mutate } = useSWR(apiUrl(`/posts/comments/all?post_id=${post.id}`), fetcher);
  const initialPosts = useMemo(() => [post], [post]);
  const { likesState, likesCount, handleLike } = useLikes(initialPosts);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { if (!file) { setPreview(""); return; } const url=URL.createObjectURL(file); setPreview(url); return () => URL.revokeObjectURL(url); }, [file]);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (!text.trim() || pending) return; setPending(true); setError("");
    try {
      const form = new FormData(); form.set("post_id", post.id); form.set("content", text.trim()); if(file) form.set("file",file);
      const response = await fetch(apiUrl("/posts/comments"), { method: "POST", credentials: "include", body: form });
      if (!response.ok) throw new Error();
      setText(""); setFile(null); mutate();
    } catch { setError("Your comment couldn’t be posted. Please try again."); }
    finally { setPending(false); }
  }
  const comments: Comment[] = Array.isArray(data) ? data : [];
  return <div className="post-detail">
    <Button variant="ghost" onClick={onClose} className="mb-5"><ArrowLeft size={17} /> Back to the conversation</Button>
    <div className="post-card"><PostItem post={{...post, comments_count: comments.length}} hasLiked={likesState[post.id] ?? post.has_liked} likesCount={likesCount[post.id] ?? post.likes_count} onLike={() => handleLike(post.id)} onSelectPost={() => input.current?.focus()} /></div>
    <div className="section-line"><h2>In the conversation</h2><span>{comments.length} comments</span></div>
    {isLoading && <p className="inline-note">Loading the conversation…</p>}
    {loadError && <p role="alert" className="inline-error">We couldn’t load comments.<button className="underline ml-2" onClick={() => mutate()}>Try again</button></p>}
    <div className="comment-list">{comments.map(comment => <CommentItem key={comment.id} comment={{...comment, avatar: comment.avatar ? apiUrl(`/avatars/${comment.avatar}`) : "/profile.png"}} />)}</div>
    {!isLoading && !loadError && !comments.length && <p className="inline-note py-4">Be the first to add something.</p>}
    <form onSubmit={submit} className="comment-compose">
      {preview && <div className="attachment-preview"><img src={preview} alt="Comment attachment" /><button type="button" className="icon-button" aria-label="Remove attachment" onClick={() => setFile(null)}><X size={17} /></button></div>}
      {error && <p role="alert" className="inline-error mb-3">{error}</p>}
      <div className="flex items-center gap-2"><Input ref={input} aria-label="Your comment" placeholder="Add to the conversation…" value={text} onChange={e => setText(e.target.value)} maxLength={250} required disabled={pending} /><label className="icon-button attachment-label"><ImagePlus size={20} /><span className="sr-only">Attach an image</span><input type="file" accept="image/jpeg,image/png,image/gif" className="sr-only" onChange={e => setFile(e.target.files?.[0] || null)} /></label><Button type="submit" size="icon" aria-label="Post comment" disabled={pending || !text.trim()}><Send size={17} /></Button></div>
    </form>
  </div>;
}
