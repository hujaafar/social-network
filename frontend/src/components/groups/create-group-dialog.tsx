"use client";
import { apiUrl } from "@/lib/api";


import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refreshGroups: () => void;
}

export function CreateGroupDialog({
  open,
  onOpenChange,
  refreshGroups,
}: CreateGroupDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true); setError("");

    try {
      await axios.post(
        apiUrl("/groups/create"),
        { name, description },
        { withCredentials: true }
      );
      onOpenChange(false);
      setName("");
      setDescription("");
      refreshGroups(); // Refresh groups after creation
    } catch {
      setError("Your circle could not be created. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="post-compose-dialog">
        <DialogHeader>
          <DialogTitle>Start a circle.</DialogTitle>
          <DialogDescription>
            Bring people together around something you love.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Circle name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          {error && <p role="alert" className="inline-error">{error}</p>}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Group"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
