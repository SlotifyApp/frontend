"use client";
import { toast } from "@/hooks/use-toast";
import React, { useEffect, createContext, useContext, useState } from "react";
import fetchHelpers from "@/hooks/fetchHelpers";

import slotifyClient from "@/hooks/fetch";

export interface Notification {
  id: number;
  message: string;
  created: string;
}

interface NotificationContextType {
  notifications: Notification[];
  markAsRead: (id: number) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  //notifs from db

  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const getUnreadNotifs = async () => {
      const { data, error } = await slotifyClient.GET(
        "/api/users/me/notifications",
      );
      if (error) {
        fetchHelpers.toastDestructiveError(error as unknown as undefined);
      }
      if (data) {
        setNotifications((prev) => [...prev, ...data]);
      }
    };
    getUnreadNotifs();
    console.log("Initializing EventSource...");

    const eventSource = new EventSource("http://localhost:8080/api/events", {
      withCredentials: true,
    });

    eventSource.addEventListener("calendar_notification", (event) => {
      const newNotification: Notification = JSON.parse(event.data);
      setNotifications((prev) => [newNotification, ...prev]);
      toast({
        title: "New Notification",
        description: newNotification.message,
      });
      const audio = new Audio(
        "https://www.soundjay.com/buttons/sounds/button-14.mp3",
      );
      audio.play();
    });

    return () => {
      eventSource.close();
    };
  }, []);

  async function markAsRead(notification_id: number): Promise<void> {
    console.log(`postNotificationRead, notificationID: ${notification_id}`);
    const { data, error } = await slotifyClient.PATCH(
      "/api/notifications/{notificationID}/read",
      {
        params: {
          path: { notificationID: notification_id },
        },
      },
    );
    if (data) {
      setNotifications(notifications.filter((n) => n.id !== notification_id));
      toast({
        title: data,
      });
    } else {
      fetchHelpers.toastDestructiveError(error as unknown as undefined);
    }
  }

  return (
    <NotificationContext.Provider value={{ notifications, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
}
