"use client";
import { apiUrl } from "@/lib/api";

import { useParams } from "next/navigation";
import { useUserProfile } from "@/lib/hooks/swr/getUserProfile";
import ProfileHeader from "@/components/profile/profileHeader";
import ProfileTabs from "@/components/profile/profileTabs";
import { LockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import Alert from "@/components/ui/alert";
import { useState } from "react";
import LoadingSpinner from "@/components/ui/loading-spinner";
export default function ProfilePage() {
  const params = useParams();
  const [isRequested, setIsRequested] = useState(false);
  const [requestPending, setRequestPending] = useState(false);
  const userId = params?.id as string | undefined;
  const { user, isLoading, isError } = useUserProfile(userId);
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  if (!userId) return <p className="text-center text-red-500">Invalid user ID.</p>;
  if (isLoading) return <LoadingSpinner size="large" />;
  if (isError) return <p className="text-center text-red-500">Error loading profile.</p>;
  const followRequest = async (followedId: string) => {
    if (requestPending) return;
    setRequestPending(true);
    try {
      await axios.post(
        apiUrl("/follow"),
        { followed_id: followedId },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      setIsRequested(true);
      setAlert({ type: "success", message: "Follow request sent." });
    } catch {
      setAlert({ type: "error", message: "We couldn’t send your request. Please try again." });
    } finally {
      setRequestPending(false);
    }
  };
  // Handle Private Profile Case
  if (user.private && !user.is_following && !user.is_my_profile) {
    return (
      <div className="page-wrap profile-private">
        <div className="empty-state">
          <LockIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">This Profile is Private</h2>
          <p className="text-gray-500 mt-2">
            You must follow <span className="font-medium">@{user.nickname}</span> to view their
            posts and details.
          </p>
          {alert && (
            <p className={alert.type === "error" ? "inline-error" : "inline-note"} role="status">
              {alert.message}
            </p>
          )}
          {!user.is_my_profile && user.pending === "0" && !isRequested && (
            <Button
              className="mt-4 new-post-button"
              disabled={requestPending}
              onClick={() => followRequest(user.id)}
            >
              {requestPending ? "Sending request…" : "Request to follow"}
            </Button>
          )}
          {((!user.is_my_profile && user.pending === "1") ||
            (!user.is_my_profile && isRequested)) && (
            <Button className="mt-4" disabled>
              Requested
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {alert && (
        <Alert
          title={alert.type === "success" ? "Success" : "Error"}
          message={alert.message}
          type={alert.type}
          duration={5000}
          onClose={() => setAlert(null)}
        />
      )}
      <div className="w-full max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        <ProfileHeader user={user} />
        <ProfileTabs user={user} />
      </div>
    </>
  );
}
