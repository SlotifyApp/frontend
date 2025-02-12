"use client";
import { useEffect, useState } from "react";
import { Member } from "@/components/team-members";
import fetchHelpers from "@/hooks/fetchHelpers";

import { User as LucideUserIcon } from "lucide-react";

export default function User() {
  const [user, setUser] = useState<Member | null>(null);
  // const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      // This code is less ugly now and needs to be done for the refresh.
      // Type Guard to check if userData is of interface type "Member"
      function isMember(data: unknown): data is Member {
        if (typeof data != "object" || data == null) {
          return false;
        }
        const obj = data as Record<string, unknown>;
        return (
          "id" in obj && typeof obj.id === "number" &&
          "email" in obj && typeof obj.email === "string" &&
          "firstName" in obj && typeof obj.firstName === "string" &&
          "lastName" in obj && typeof obj.lastName === "string"
        );
      }

      const userRoute = "/api/users/me"
      const userData = await fetchHelpers.getAPIrouteData(userRoute, {});
      if (isMember(userData)) {
        setUser(userData);
      }
    };
    fetchUser();
  }, []);

  if (!user) return "No user";

  return (
    <div className="flex flex-row w-screen ml-20">
      <LucideUserIcon className="h-10 w-10" />
      <div className="flex flex-row justify-center items-center ml-5 font-semibold text-2xl">
        Welcome {user.firstName}
      </div>
    </div>
  );
}
