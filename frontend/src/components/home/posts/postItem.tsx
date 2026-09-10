/* eslint-disable @next/next/no-img-element -- User uploads and blob previews preserve native GIF playback without proxying private media. */
import { Heart, MessageCircle, Globe2, LockKeyhole, Users } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatPostDate } from "@/lib/utils";
import { apiUrl } from "@/lib/api";
import { Post } from "@/types/post";
import { SavePostButton } from "./save-post-button";
interface PostItemProps {
  post: Post;
  hasLiked: boolean;
  likesCount: number;
  onLike: () => void;
  onSelectPost: () => void;
  likePending?: boolean;
  hideImage?: boolean;
}
export default function PostItem({
  post,
  hasLiked,
  likesCount,
  onLike,
  onSelectPost,
  likePending = false,
  hideImage = false,
}: PostItemProps) {
  const PrivacyIcon =
    post.privacy === "private" ? LockKeyhole : post.privacy === "almost-private" ? Users : Globe2;
  return (
    <article className="post-content">
      <header className="post-author">
        <Link
          href={`/profile/${post.user_id}`}
          aria-label={`View ${post.nickname || "member"}’s profile`}
        >
          <Avatar>
            <AvatarImage
              src={post.avatar ? apiUrl(`/avatars/${post.avatar}`) : "/profile.png"}
              alt=""
            />
            <AvatarFallback>{post.nickname?.charAt(0) || "C"}</AvatarFallback>
          </Avatar>
        </Link>
        <div>
          <Link href={`/profile/${post.user_id}`}>{post.nickname || "Community member"}</Link>
          <span>
            {post.created_at ? formatPostDate(post.created_at) : "Just now"}
            <span aria-label={post.privacy || "public"}>
              <PrivacyIcon size={12} />
            </span>
          </span>
        </div>
      </header>
      <p className="post-copy">{post.content}</p>
      {post.image_url && !hideImage && (
        <button className="post-photo" onClick={onSelectPost} aria-label="Open post and comments">
          <img
            src={apiUrl(`/uploads/${post.image_url}`)}
            alt="Photo shared with this post"
            loading="lazy"
          />
        </button>
      )}
      <footer className="post-actions">
        <button
          onClick={onLike}
          disabled={likePending}
          aria-pressed={hasLiked}
          aria-label={hasLiked ? "Unlike post" : "Like post"}
          className={hasLiked ? "liked" : ""}
        >
          <Heart size={19} fill={hasLiked ? "currentColor" : "none"} />
          <span>
            {likesCount} <span className="action-label">likes</span>
          </span>
        </button>
        <button onClick={onSelectPost}>
          <MessageCircle size={19} />
          <span>
            {post.comments_count || 0} <span className="action-label">comments</span>
          </span>
        </button>
        <button className="join-conversation" onClick={onSelectPost}>
          Join in <span aria-hidden="true">↗</span>
        </button>
        <SavePostButton post={post} />
      </footer>
    </article>
  );
}
