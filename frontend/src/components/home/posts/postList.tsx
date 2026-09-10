"use client";
import Cookies from "js-cookie";
import { MessageCircle, RefreshCw, Plus } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useLikes } from "@/lib/hooks/useLikes";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import PostItem from "./postItem";
import { DeletePostButton } from "./DeletePostButton";
import { Post } from "@/types/post";
interface Props { posts: Post[]; isLoading?: boolean; isError?: boolean; onSelectPost: (post: Post) => void; onRetry?: () => void; onCreate?: () => void; }
export default function PostsList({ posts, isLoading, isError, onSelectPost, onRetry, onCreate }: Props) {
  const safePosts = Array.isArray(posts) ? posts : [];
  const { likesState, likesCount, handleLike } = useLikes(safePosts, onRetry);
  const reduceMotion = useReducedMotion();
  const currentUserId = Cookies.get("user_id");
  if (isLoading) return <div aria-label="Loading posts" className="feed-skeleton">{[0,1].map(i => <div key={i} className="post-card"><Skeleton className="h-10 w-40 mb-6" /><Skeleton className="h-4 w-full mb-3" /><Skeleton className="h-40 w-full" /></div>)}</div>;
  if (isError) return <div className="empty-state" role="alert"><RefreshCw size={30} /><h3>A little pause in the conversation.</h3><p>We couldn’t load your feed. Your posts are safe; try connecting again.</p><Button onClick={onRetry} variant="outline">Try again</Button></div>;
  if (!safePosts.length) return <div className="empty-state"><MessageCircle size={32} /><h3>Every conversation starts somewhere.</h3><p>Share your first moment, or find people through search and circles.</p>{onCreate && <Button onClick={onCreate}><Plus size={16} /> Share a moment</Button>}</div>;
  return <div className="post-list">{safePosts.map(post =>
    <motion.div key={post.id} className="post-card" initial={false} whileInView={reduceMotion ? undefined : { y: [14, 0], opacity: [.65, 1] }} viewport={{ once: true, amount: .12 }} transition={{ duration: .5, ease: [0.2, .75, .25, 1] }}>
      {post.user_id === currentUserId && <div className="post-delete"><DeletePostButton postId={post.id} /></div>}
      <PostItem post={post} hasLiked={likesState[post.id] ?? post.has_liked} likesCount={likesCount[post.id] ?? post.likes_count ?? 0} onLike={() => handleLike(post.id)} onSelectPost={() => onSelectPost(post)} />
    </motion.div>)}</div>;
}

