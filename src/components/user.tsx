"use client";
import { useEffect, useState } from "react";
import client from "@/hooks/fetch";
import { Member } from "@/components/team-members";
import "@/globalFunc";

export default function User() {
  const [user, setUser] = useState<Member | null>(null);
  // const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const refreshUser = async () => {
      const { response } = await client.POST("/api/refresh", {});
      return response.status != 401;
    };

    const fetchUser = async () => {
      // This code is less ugly now and needs to be done for the refresh.
      // I moved everything into 1 big try/catch block as it looks nicer than individual error handling
      try {
        const { data: userData, response } = await client.GET("/api/users/me", {});
        console.log("User Data: ", JSON.stringify(userData));
        console.log("Response: ", JSON.stringify(response));
        // Switch case replaces if/else blocks
        switch (response.status) {
          case 200: // Success
            if (userData)
              setUser(userData)
            break;
          case 401: // user was unauthorised. Therefore, /refresh.
            const refreshSuccessful = await refreshUser();
            if (!refreshSuccessful) {
              //If refresh fails due to unauthorized user, log the user out
              await client.POST("/api/users/me/logout", {});
              window.location.href = "/login";
            } 
            break;
          case 201:
            const { data: retryData } = await client.GET("/api/users/me", {});
            if (retryData)
              setUser(retryData);
            break;
        }
      } catch (error) {
        globalThis.toastDestructiveError(error as undefined);
      }
    };
    fetchUser();
  }, []);

  if (!user) return "No user";

  return (
    <div>
      <h1>
        Welcome, {user.firstName} {user.lastName}!
      </h1>
      <p>Email: {user.email}</p>
      <p>User ID: {user.id}</p>
    </div>
  );
}
