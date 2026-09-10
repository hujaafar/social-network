import { apiUrl } from "@/lib/api";
import axios from "axios";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export const handleLogout = async (router: AppRouterInstance) => {
  try {
    await axios.post(
      apiUrl("/logout"),
      {},
      {
        withCredentials: true,
      }
    );
    router.push("/login");
  } catch (error) {
    console.log("Logout failed:", error);
  }
};
