"use client";
import { useState, useDeferredValue } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  ArrowUpRight,
  Image as ImageIcon,
  MessageCircle,
  X,
  Users,
  Asterisk,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreatePostPopup } from "@/components/home/posts/CreatePostPopup";
import PostsList from "@/components/home/posts/postList";
import { PostView } from "@/components/home/posts/postView";
import { EditorialImage } from "@/components/design/editorial-image";
import { usePosts } from "@/lib/hooks/swr/getPosts";
import { Post } from "@/types/post";
import { useSearch } from "@/lib/hooks/useSearch";
import { User } from "@/types/user";
import { Group } from "@/types/groupTypes";

export function MainContent() {
  const { posts, isLoading, isError, refreshPosts } = usePosts();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchQuery = useDeferredValue(query.trim());
  const { searchResults, isLoading: searching, isError: searchError } = useSearch(searchQuery);
  return (
    <div className="feed-page">
      <div className="feed-heading">
        <div>
          <span className="eyebrow">YOUR DAILY DOSE OF COMMON</span>
          <h1>
            IN THE <em>LOOP.</em>
          </h1>
        </div>
        <Button
          className="new-post-button heading-post-button"
          onClick={() => setIsCreatePostOpen(true)}
        >
          <Plus size={18} /> Share a moment
        </Button>
      </div>
      <div className="feed-layout">
        <section className="feed-stream" aria-label="Your feed">
          <div className="feed-tools">
            <div className="search-field">
              <Search size={18} aria-hidden="true" />
              <Input
                aria-label="Search people and circles"
                placeholder="Find people or circles"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button
                  className="icon-button"
                  aria-label="Clear search"
                  onClick={() => setQuery("")}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
          {!searchQuery && !selectedPost && (
            <>
              <button className="composer-prompt" onClick={() => setIsCreatePostOpen(true)}>
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
              <div className="section-line">
                <h2>The latest</h2>
                <span>From your community</span>
              </div>
            </>
          )}
          {searchQuery ? (
            <section className="search-results" aria-live="polite" aria-label="Search results">
              <h2>Find your people.</h2>
              {searching && <p className="inline-note">Looking around…</p>}
              {searchError && (
                <p role="alert" className="inline-error">
                  Search is unavailable. Please try again.
                </p>
              )}
              {searchResults && (
                <>
                  <h3>People</h3>
                  {searchResults.users?.length ? (
                    searchResults.users.map((user: User) => (
                      <Link className="search-result" key={user.id} href={`/profile/${user.id}`}>
                        <span className="initial-avatar">{user.nickname?.charAt(0) || "C"}</span>
                        <strong>{user.nickname || `${user.first_name} ${user.last_name}`}</strong>
                        <ArrowUpRight size={18} />
                      </Link>
                    ))
                  ) : (
                    <p className="inline-note">No people match “{searchQuery}”.</p>
                  )}
                  <h3>Circles</h3>
                  {searchResults.groups?.length ? (
                    searchResults.groups.map((group: Group) => (
                      <Link className="search-result" key={group.id} href={`/groups#${group.id}`}>
                        <Users size={22} />
                        <strong>{group.name}</strong>
                        <ArrowUpRight size={18} />
                      </Link>
                    ))
                  ) : (
                    <p className="inline-note">No circles match “{searchQuery}”.</p>
                  )}
                </>
              )}
            </section>
          ) : selectedPost ? (
            <PostView
              post={selectedPost}
              onClose={() => {
                setSelectedPost(null);
                refreshPosts();
              }}
              likesState={{}}
              likesCount={{}}
            />
          ) : (
            <PostsList
              posts={posts}
              isLoading={isLoading}
              isError={isError}
              onSelectPost={setSelectedPost}
              onRetry={() => refreshPosts()}
              onCreate={() => setIsCreatePostOpen(true)}
            />
          )}
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
      <CreatePostPopup
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onCreatePost={() => {
          refreshPosts();
        }}
      />
    </div>
  );
}
