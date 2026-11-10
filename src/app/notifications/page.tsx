"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [message, setMessage] = useState("Loading notifications...");
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsLoggedOut(true);
      setMessage("");
      return;
    }

    setIsLoggedOut(false);
    setUserId(user.id);

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      return;
    }

    setNotifications(data || []);
    setMessage(data?.length ? "" : "You have no notifications.");
  }

  async function markAsRead(notificationId: string) {
    if (!userId) return;

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId)
      .eq("user_id", userId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, is_read: true }
          : notification
      )
    );
  }

  return (
    <main>
      <h1>Notifications</h1>

      {isLoggedOut ? (
        <p className="notification-login-message">
          Please{" "}
          <Link href="/login" className="notification-auth-link">
            log in
          </Link>{" "}
          or{" "}
          <Link href="/signup" className="notification-auth-link">
            create an account
          </Link>{" "}
          to view your notifications.
        </p>
      ) : (
        message && <p>{message}</p>
      )}

      <section>
        {notifications.map((notification) => (
          <article
            key={notification.id}
            style={{
              border: "1px solid #ccc",
              padding: "16px",
              marginBottom: "12px",
              backgroundColor: notification.is_read ? "#ffffff" : "#eef6ff",
            }}
          >
            <h2>{notification.title}</h2>
            <p>{notification.message}</p>

            <small>
              {new Date(notification.created_at).toLocaleString()}
            </small>

            {!notification.is_read && (
              <button
                type="button"
                onClick={() => markAsRead(notification.id)}
              >
                Mark as read
              </button>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}

