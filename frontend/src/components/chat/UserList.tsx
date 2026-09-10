"use client";
import { useState } from "react";
import type { User } from "@/types/chat";
import { UserItem } from "./UserItem";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
export function UserList({
  users,
  onSelectUser,
  selectedUser,
  loading,
}: {
  users: User[];
  onSelectUser: (user: User) => void;
  selectedUser: User | null;
  loading?: boolean;
}) {
  const [query, setQuery] = useState("");
  const filtered = users.filter((user) => user.name.toLowerCase().includes(query.toLowerCase()));
  return (
    <section className="conversation-list" aria-label="Conversations">
      <header>
        <h2>
          Your people<span>{users.length}</span>
        </h2>
        <div className="search-field">
          <Search size={16} />
          <Input
            aria-label="Search conversations"
            placeholder="Find someone"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </header>
      <div className="conversation-contacts">
        {loading ? (
          <p className="inline-note p-6">Connecting to your people…</p>
        ) : !filtered.length ? (
          <p className="inline-note p-6">
            {query ? "No people match your search." : "Follow people to start a conversation."}
          </p>
        ) : (
          filtered.map((user) => (
            <UserItem
              key={user.id}
              user={user}
              onClick={() => onSelectUser(user)}
              isSelected={selectedUser?.id === user.id}
            />
          ))
        )}
      </div>
    </section>
  );
}
