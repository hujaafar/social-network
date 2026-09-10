"use client";

import Link from "next/link";
import { ArrowUpRight, Bookmark } from "lucide-react";
import PostsList from "@/components/home/posts/postList";
import { usePostReader } from "@/components/home/posts/post-reader";
import { usePosts } from "@/lib/hooks/swr/getPosts";
import { EditorialImage } from "@/components/design/editorial-image";

export default function SavedPage() {
  const { posts, isLoading, isError, refreshPosts } = usePosts("saved");
  const { openPost, reader } = usePostReader();
  return (
    <div className="saved-page">
      <header className="saved-heading">
        <div>
          <span className="eyebrow">A COLLECTION THAT’S ALL YOURS</span>
          <h1>
            KEEP THE
            <br />
            <em>GOOD STUFF.</em>
          </h1>
          <p>The ideas, people and little moments you want to come back to.</p>
        </div>
        <div className="saved-heading-image">
          <EditorialImage
            src="/images/common-objects.webp"
            alt="A collection of photography, music and art objects"
            priority
            reveal={false}
            sizes="(max-width: 600px) 100vw, 340px"
          />
        </div>
      </header>
      <div className="saved-layout">
        <section aria-label="Your saved posts">
          <div className="section-line">
            <h2>Your collection</h2>
            <span>
              {isLoading ? "Loading…" : isError ? "Unavailable" : `${posts.length} saved`}
            </span>
          </div>
          <PostsList
            posts={posts}
            isLoading={isLoading}
            isError={isError}
            onSelectPost={openPost}
            onRetry={() => refreshPosts()}
            emptyTitle="Something worth keeping."
            emptyDescription="Tap the bookmark on any post to collect it here. Only you can see your saved collection."
          />
        </section>
        <aside className="saved-note">
          <Bookmark size={27} />
          <span className="eyebrow">JUST FOR YOU</span>
          <h2>
            Your own
            <br />
            little archive.
          </h2>
          <p>Save a thought. Come back for the conversation. Keep what speaks to you.</p>
          <p className="saved-privacy-note">
            Posts stay here while their authors share them with you.
          </p>
          <Link href="/">
            Find your next save <ArrowUpRight size={17} />
          </Link>
        </aside>
      </div>
      {reader}
    </div>
  );
}
