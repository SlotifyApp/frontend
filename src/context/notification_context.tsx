"use client";
import { toast } from "@/hooks/use-toast";
import React, { useEffect, createContext, useContext, useState } from "react";
import fetchHelpers from "@/hooks/fetchHelpers";

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
      const notifRoute = "/api/users/me/notifications";
      const notifData = await fetchHelpers.getAPIrouteData(notifRoute, {});
      if (Array.isArray(notifData)) {
        setNotifications((prev) => [...prev, ...notifData]);
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
        title: newNotification.message,
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
    const readnotifRoute = "/api/notifications/{notificationID}/read";
    const readnotifData = await fetchHelpers.patchAPIrouteData(readnotifRoute, {
      params: {
        path: { notificationID: notification_id },
      },
    });
    if (readnotifData) {
      setNotifications(notifications.filter((n) => n.id !== notification_id));
      toast({
        title: JSON.stringify(readnotifData),
      });
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
