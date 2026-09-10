"use client";
import { apiUrl } from "@/lib/api";


import React from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

interface DeleteGroupButtonProps {
  groupId: string;
  onDelete?: () => void; // Optional callback if you need to redirect or refresh
}

const MySwal = withReactContent(Swal);

export function DeleteGroupButton({
  groupId,
  onDelete,
}: DeleteGroupButtonProps) {
  const handleDelete = async () => {
    const result = await MySwal.fire({
      title: "Delete Group?",
      text: "Are you sure you want to delete this group?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#bc4312",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.delete(
          apiUrl("/groups/delete"),
          {
            data: { group_id: groupId },
            withCredentials: true,
          }
        );

        // Show success alert
        await MySwal.fire({
          title: "Group Deleted",
          text: response.data,
          icon: "success",
          confirmButtonColor: "#bc4312",
        });

        if (onDelete) onDelete();
      } catch (error: unknown) {
        console.log("Error deleting group:", error);

        if (axios.isAxiosError(error)) {
          // If server says 403 => not the creator
          if (error.response?.status === 403) {
            await MySwal.fire({
              title: "Forbidden",
              text: "You are not the group creator. Only the creator can delete this group.",
              icon: "error",
              confirmButtonColor: "#bc4312",
            });
          } else {
            await MySwal.fire({
              title: "Error",
              text: error.response?.data || "Error deleting group.",
              icon: "error",
              confirmButtonColor: "#bc4312",
            });
          }
        } else {
          // Handle non-Axios errors
          await MySwal.fire({
            title: "Unexpected Error",
            text: "An unexpected error occurred while deleting the group.",
            icon: "error",
            confirmButtonColor: "#bc4312",
          });
        }
      }
    }
  };

  return <Button onClick={handleDelete}>Delete Group</Button>;
}
