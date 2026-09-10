"use client";
import { useState, useDeferredValue } from "react";
import Link from "next/link";
import { Search, Plus, ArrowUpRight, Image as ImageIcon, MessageCircle, X, Users } from "lucide-react";
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
  return <div className="feed-page">
    <div className="feed-heading">
      <div><span className="eyebrow">THE EVERYDAY, SHARED.</span><h1>Your corner<br />of the <em>internet.</em></h1></div>
      <div className="feed-heading-note"><span className="live-dot" /> Stay curious.<br />Stay connected.</div>
    </div>
    <div className="feed-layout">
      <section className="feed-stream" aria-label="Your feed">
        <div className="feed-tools">
          <div className="search-field"><Search size={18} aria-hidden="true" /><Input aria-label="Search people and circles" placeholder="Find people or circles" value={query} onChange={e => setQuery(e.target.value)} />
            {query && <button className="icon-button" aria-label="Clear search" onClick={() => setQuery("")}><X size={16} /></button>}
          </div>
          <Button className="new-post-button" onClick={() => setIsCreatePostOpen(true)}><Plus size={18} /><span>New post</span></Button>
        </div>
        {!searchQuery && !selectedPost && <>
          <div className="feed-cover">
            <EditorialImage src="/images/common-studio.webp" alt="Friends making space for a conversation in a creative studio" priority />
            <div className="cover-label"><span>COMMON GROUND</span><span>GOOD THINGS START WITH A HELLO.</span><ArrowUpRight size={20} aria-hidden="true" /></div>
          </div>
          <button className="composer-prompt" onClick={() => setIsCreatePostOpen(true)}><span className="composer-icon"><MessageCircle size={22} /></span><span>What’s on your mind?<small>A thought, a photo, a little update.</small></span><ImageIcon size={21} /></button>
          <div className="section-line"><h2>The conversation</h2><span>Latest moments</span></div>
        </>}
        {searchQuery ? <section className="search-results" aria-live="polite" aria-label="Search results">
          <h2>Find your people.</h2>
          {searching && <p className="inline-note">Looking around…</p>}
          {searchError && <p role="alert" className="inline-error">Search is unavailable. Please try again.</p>}
          {searchResults && <>
            <h3>People</h3>
            {searchResults.users?.length ? searchResults.users.map((user: User) => <Link className="search-result" key={user.id} href={`/profile/${user.id}`}><span className="initial-avatar">{user.nickname?.charAt(0) || "C"}</span><strong>{user.nickname || `${user.first_name} ${user.last_name}`}</strong><ArrowUpRight size={18} /></Link>) : <p className="inline-note">No people match “{searchQuery}”.</p>}
            <h3>Circles</h3>
            {searchResults.groups?.length ? searchResults.groups.map((group: Group) => <Link className="search-result" key={group.id} href={`/groups#${group.id}`}><Users size={22} /><strong>{group.name}</strong><ArrowUpRight size={18} /></Link>) : <p className="inline-note">No circles match “{searchQuery}”.</p>}
          </>}
        </section> : selectedPost ? <PostView post={selectedPost} onClose={() => { setSelectedPost(null); refreshPosts(); }} likesState={{}} likesCount={{}} /> :
          <PostsList posts={posts} isLoading={isLoading} isError={isError} onSelectPost={setSelectedPost} onRetry={() => refreshPosts()} onCreate={() => setIsCreatePostOpen(true)} />}
      </section>
      <aside className="discovery-rail" aria-label="Discover Common">
        <div className="rail-note"><span className="eyebrow">BETTER TOGETHER</span><h2>Find a little<br /><em>common ground.</em></h2><p>Big interests. Small obsessions. There’s a circle for that.</p><Link href="/groups">Explore circles <ArrowUpRight size={18} /></Link></div>
        <Link href="/groups" className="discovery-art"><div className="discovery-art-image"><EditorialImage src="/images/common-objects.webp" alt="A camera, headphones and art books in warm afternoon light" /></div><div><span className="eyebrow">MAKE ROOM FOR YOUR INTERESTS</span><h3>Something to<br />talk about.</h3><ArrowUpRight size={24} /></div></Link>
        <div className="rail-link"><span>Keep the conversation going.</span><Link href="/chat">Open messages <ArrowUpRight size={17} /></Link></div>
      </aside>
    </div>
    <CreatePostPopup isOpen={isCreatePostOpen} onClose={() => setIsCreatePostOpen(false)} onCreatePost={() => { refreshPosts(); }} />
  </div>;
}

