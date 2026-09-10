"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateGroupDialog } from "@/components/groups/create-group-dialog";
import { GroupList } from "@/components/groups/group-list";
import { useGroups } from "@/lib/hooks/use-groups";
import { apiUrl } from "@/lib/api";
import { EditorialImage } from "@/components/design/editorial-image";
import axios from "axios";
export default function GroupsPage() {
  const [query, setQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [actionError, setActionError] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const { groups, joinedGroups, isLoading, error, refreshGroups } = useGroups();
  const router = useRouter();
  async function requestToJoin(id: string) {
    setPending(id); setActionError("");
    try { await axios.post(apiUrl("/groups/join"), { group_id: id }, { withCredentials: true }); await refreshGroups(); }
    catch { setActionError("We couldn’t send your request. Please try again."); }
    finally { setPending(null); }
  }
  const filter = (items: typeof groups) => items.filter(group => `${group.name} ${group.description}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <div className="page-wrap circles-page">
    <header className="page-intro"><div><span className="eyebrow">FIND YOUR COMMON GROUND</span><h1 className="page-title">Small circles.<br /><em>Big connections.</em></h1><p>A space for the things you can’t stop talking about.</p></div><Button onClick={() => setIsCreateOpen(true)} className="new-post-button"><Plus size={18} /> Create a circle</Button></header>
    <div className="circles-banner"><div><span className="eyebrow">A GOOD CONVERSATION CHANGES EVERYTHING.</span><p>Come for an interest.<br />Stay for the people.</p></div><div><EditorialImage src="/images/common-objects.webp" alt="A camera, headphones and books celebrating shared interests" /></div></div>
    <div className="search-field circles-search"><Search size={18} /><Input aria-label="Search circles" placeholder="Find your thing. Photography, music, anything…" value={query} onChange={e => setQuery(e.target.value)} /></div>
    {(error || actionError) && <div className="inline-error mb-6" role="alert">{error || actionError}{error && <button className="block underline mt-2" onClick={refreshGroups}>Try again</button>}</div>}
    <Tabs defaultValue="discover"><TabsList className="circles-tabs"><TabsTrigger value="discover">Discover circles <span>{groups.length}</span></TabsTrigger><TabsTrigger value="joined">Your circles <span>{joinedGroups.length}</span></TabsTrigger></TabsList>
      <TabsContent value="discover"><GroupList groups={filter(groups)} type="discover" isLoading={isLoading} requestToJoin={requestToJoin} enterGroupChat={id => router.push(`/groups/${id}`)} pending={pending} /></TabsContent>
      <TabsContent value="joined"><GroupList groups={filter(joinedGroups)} type="joined" isLoading={isLoading} requestToJoin={requestToJoin} enterGroupChat={id => router.push(`/groups/${id}`)} pending={pending} /></TabsContent>
    </Tabs>
    <CreateGroupDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} refreshGroups={refreshGroups} />
  </div>;
}

