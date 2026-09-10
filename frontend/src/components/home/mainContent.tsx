"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Image as ImageIcon, MessageCircle, Asterisk, Bookmark } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostsList from "@/components/home/posts/postList";
import { usePostReader } from "@/components/home/posts/post-reader";
import { EditorialImage } from "@/components/design/editorial-image";
import { useWorkspace } from "@/components/design/workspace-tools";
import { usePosts } from "@/lib/hooks/swr/getPosts";

export function MainContent() {
  const [feed, setFeed] = useState<"all" | "following">("all");
  const { posts, isLoading, isError, refreshPosts } = usePosts(feed);
  const { openComposer, openSearch } = useWorkspace();
  const { openPost, reader } = usePostReader();
  return (
    <div className="feed-page">
      <div className="feed-heading">
        <div>
          <span className="eyebrow">YOUR DAILY DOSE OF COMMON</span>
          <h1>
            IN THE <em>LOOP.</em>
          </h1>
        </div>
        <Link href="/saved" className="collection-link">
          <Bookmark size={18} /> Your collection <ArrowUpRight size={17} />
        </Link>
      </div>
      <div className="feed-layout">
        <section className="feed-stream" aria-label="Your feed">
          <button className="composer-prompt" onClick={openComposer}>
            <span className="composer-icon">
              <MessageCircle size={22} />
            </span>
            <span>
              What’s on your mind?<small>A thought, a photo, a little update.</small>
            </span>
            <ImageIcon size={21} />
          </button>
          <Link href="/groups" className="feed-campaign">
            <div className="feed-campaign-copy">
              <span className="eyebrow">FIND YOUR COMMON GROUND</span>
              <strong>
                YOUR PEOPLE.
                <br />
                YOUR KIND
                <br />
                OF ENERGY<span>.</span>
              </strong>
              <span className="campaign-action">
                Explore circles <ArrowUpRight size={19} />
              </span>
            </div>
            <div className="feed-campaign-image">
              <EditorialImage
                src="/images/common-afterhours.webp"
                alt="Friends enjoying an evening together on a rooftop"
                priority
                reveal={false}
                sizes="(max-width: 600px) 60vw, 35vw"
              />
              <Asterisk className="campaign-asterisk" aria-hidden="true" />
            </div>
          </Link>

          <Tabs
            value={feed}
            onValueChange={(value) => setFeed(value as "all" | "following")}
            className="feed-tabs"
          >
            <div className="feed-tabs-heading">
              <TabsList aria-label="Choose your feed">
                <TabsTrigger value="all">The latest</TabsTrigger>
                <TabsTrigger value="following">Following</TabsTrigger>
              </TabsList>
              <span>GOOD THINGS, SHARED.</span>
            </div>
            <TabsContent value={feed}>
              <PostsList
                posts={posts}
                isLoading={isLoading}
                isError={isError}
                onSelectPost={openPost}
                onRetry={() => refreshPosts()}
                onCreate={feed === "all" ? openComposer : undefined}
                emptyTitle={feed === "following" ? "Make this feed feel like you." : undefined}
                emptyDescription={
                  feed === "following"
                    ? "Follow people you connect with. Their shared moments will appear here once your follow is accepted."
                    : undefined
                }
              />
              {feed === "following" && !posts.length && !isLoading && !isError && (
                <button className="following-find-button" onClick={openSearch}>
                  Find your people <ArrowUpRight size={18} />
                </button>
              )}
            </TabsContent>
          </Tabs>
        </section>
        <aside className="discovery-rail" aria-label="Discover Common">
          <div className="rail-note">
            <span className="eyebrow">STRANGERS → YOUR PEOPLE</span>
            <Asterisk className="rail-asterisk" size={52} aria-hidden="true" />
            <h2>
              A GOOD KIND
              <br />
              OF <em>OBSESSION.</em>
            </h2>
            <p>Find the people who care about the same little things.</p>
            <Link href="/groups">
              Find your circle <ArrowUpRight size={18} />
            </Link>
          </div>
          <Link href="/groups" className="discovery-art">
            <div className="discovery-art-image">
              <EditorialImage
                src="/images/common-objects.webp"
                alt="A camera, headphones and art books in warm afternoon light"
                reveal={false}
                sizes="(max-width: 1180px) 35vw, 280px"
              />
            </div>
            <div>
              <span className="eyebrow">FOLLOW YOUR CURIOSITY</span>
              <h3>
                Find your
                <br />
                next thing.
              </h3>
              <ArrowUpRight size={24} />
            </div>
          </Link>
          <div className="rail-link">
            <span>Keep the conversation going.</span>
            <Link href="/chat">
              Open messages <ArrowUpRight size={17} />
            </Link>
          </div>
        </aside>
      </div>

      {reader}
    </div>
  );
}
