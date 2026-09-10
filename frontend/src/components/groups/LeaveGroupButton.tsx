"use client";
import { apiUrl } from "@/lib/api";
// components/groups/LeaveGroupButton.tsx

import React from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

interface LeaveGroupButtonProps {
  groupId: string;
  onLeave?: () => void;
}

const MySwal = withReactContent(Swal);

export function LeaveGroupButton({ groupId, onLeave }: LeaveGroupButtonProps) {
  const handleLeave = async () => {
    const result = await MySwal.fire({
      title: "Leave Group?",
      text: "Are you sure you want to leave this group?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#bc4312", 
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, leave",
      cancelButtonText: "Cancel",
    });

    // If the user clicked "Yes, leave"
    if (result.isConfirmed) {
      try {
        const response = await axios.delete(apiUrl("/groups/leave"), {
          data: { group_id: groupId },
          withCredentials: true,
        });

        await MySwal.fire({
          title: "Left Group",
          text: response.data, 
          icon: "success",
          confirmButtonColor: "#bc4312",
        });

        if (onLeave) onLeave();
      } catch (error: unknown) {

        if (axios.isAxiosError(error)) {
          if (error.response?.status === 403) {
            await MySwal.fire({
              title: "Forbidden",
              text: "You are the group creator. Please delete the group instead.",
              icon: "error",
              confirmButtonColor: "#bc4312",
            });
          } else {
            await MySwal.fire({
              title: "Error",
              text: error.response?.data || "Error leaving group.",
              icon: "error",
              confirmButtonColor: "#bc4312",
            });
          }
        } else {
          // Handle non-Axios errors gracefully
          await MySwal.fire({
            title: "Unexpected Error",
            text: "An unexpected error occurred while leaving the group.",
            icon: "error",
            confirmButtonColor: "#bc4312",
          });
        }
      }
    }
  };

  return (
    <Button variant="destructive" onClick={handleLeave}>
      Leave Group
    </Button>
  );
}
