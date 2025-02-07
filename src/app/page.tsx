"use client";
import { useEffect } from "react";
import slotifyClient from "@/hooks/fetch";
import { Button } from "@/components/ui/button";

export default function Home() {
  useEffect(() => {
    const fetchUser = async () => {
      // Detects whether the access token or refresh token are valid.
      // If either one is, then redirect to /dashboard.
      // Done through:
      // 1. Attempt to get /user route, if 200 then redirect to /dashboard
      // 2. if 401 then attempt to refresh
      // 3. If refresh fails then do nothing, if it succeeds then redirect to /dashboard
      const { response } = await slotifyClient.GET("/api/users/me", {});
      if (response.status == 200) {
        window.location.href = "/dashboard";
      } else if (response.status == 401) {
        const { response } = await slotifyClient.POST("/api/refresh", {});
        if (response.status == 201) {
          window.location.href = "/dashboard";
        }
      }
    };
    fetchUser();
  }, []);
  return (
    <div>
      <Button onClick={() => (window.location.href = "/login")}>Login</Button>
    </div>
  );
}
