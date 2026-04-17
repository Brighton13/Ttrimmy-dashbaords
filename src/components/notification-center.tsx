"use client";

import { useEffect, useMemo, useState } from "react";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  readAt: string | null;
  createdAt: string;
};

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export function NotificationCenter({
  realtimeToken,
  initialNotifications,
}: {
  realtimeToken: string;
  initialNotifications: NotificationItem[];
}) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const socket = new WebSocket(
      `${protocol}://${window.location.host}/ws?token=${encodeURIComponent(realtimeToken)}`,
    );

    socket.addEventListener("open", () => {
      setConnected(true);
    });

    socket.addEventListener("close", () => {
      setConnected(false);
    });

    socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data) as {
        type: string;
        payload: {
          notificationId: string;
          title: string;
          message: string;
          type: string;
          createdAt: string;
        };
      };

      if (data.type !== "notification.created") {
        return;
      }

      setNotifications((current) => [
        {
          id: data.payload.notificationId,
          title: data.payload.title,
          message: data.payload.message,
          type: data.payload.type,
          createdAt: data.payload.createdAt,
          readAt: null,
        },
        ...current,
      ]);
    });

    return () => {
      socket.close();
    };
  }, [realtimeToken]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.readAt).length,
    [notifications],
  );

  async function markRead(notificationId: string) {
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId }),
    });

    setNotifications((current) =>
      current.map((item) =>
        item.id === notificationId ? { ...item, readAt: new Date().toISOString() } : item,
      ),
    );
  }

  return (
    <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm shadow-stone-200/60">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
            Notifications
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
            Recent updates
          </h2>
        </div>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
            connected
              ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
              : "bg-stone-100 text-slate-600 ring-stone-200"
          }`}
        >
          {connected ? `${unreadCount} unread` : "stored updates"}
        </span>
      </div>
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-5 text-sm text-slate-500">
            No notifications yet.
          </div>
        ) : (
          notifications.slice(0, 6).map((item) => (
            <article
              className={`rounded-2xl border p-4 transition ${
                item.readAt
                  ? "border-stone-200 bg-stone-50"
                  : "border-amber-200 bg-amber-50/60"
              }`}
              key={item.id}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <strong className="text-sm font-semibold text-slate-900">{item.title}</strong>
                  <p className="mt-1 text-xs text-slate-500">
                    {timeFormatter.format(new Date(item.createdAt))} UTC
                  </p>
                </div>
                {!item.readAt ? (
                  <button
                    className="inline-flex rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-stone-200 transition hover:bg-stone-50"
                    onClick={() => void markRead(item.id)}
                  >
                    Mark read
                  </button>
                ) : null}
              </div>
              <p className="mt-3 text-sm text-slate-600">{item.message}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}