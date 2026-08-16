import React, { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck, X } from "lucide-react";
import { notificationAPI } from "../../services/index";
import { T, formatShortDate } from "../../design/tokens";

export default function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const panelRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await notificationAPI.getAll({ limit: 8 });
      const list = res.data?.data?.notifications || [];
      setItems(list);
      setUnread(list.filter((n) => !n.isRead).length);
    } catch {
      setItems([]);
      setUnread(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const markAll = async () => {
    try {
      await notificationAPI.markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnread(0);
    } catch { /* keep previous */ }
  };

  const markOne = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setItems((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      setUnread((u) => Math.max(0, u - 1));
    } catch { /* keep previous */ }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => !v);
          if (!open) load();
        }}
        className="relative p-2.5 rounded-full border transition-colors"
        style={{ borderColor: T.border, color: T.inkMid, background: T.surfaceRaised }}
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
            style={{ background: T.danger }}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-[min(100vw-2rem,340px)] rounded-2xl border shadow-xl z-50 overflow-hidden"
          style={{ background: T.surfaceRaised, borderColor: T.border }}
          role="dialog"
          aria-label="Notifications"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: T.borderSoft }}>
            <p className="text-sm font-semibold" style={{ color: T.ink }}>Notifications</p>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button
                  type="button"
                  onClick={markAll}
                  className="text-[11px] font-semibold px-2 py-1 rounded-lg inline-flex items-center gap-1"
                  style={{ color: T.teal }}
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all
                </button>
              )}
              <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="p-1 rounded-lg" style={{ color: T.inkLight }}>
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <p className="text-sm py-8 text-center" style={{ color: T.inkLight }}>Loading…</p>
            )}
            {!loading && items.length === 0 && (
              <p className="text-sm py-8 text-center px-4" style={{ color: T.inkLight }}>
                You're all caught up. No new notifications.
              </p>
            )}
            {!loading && items.map((n) => (
              <button
                key={n._id}
                type="button"
                onClick={() => markOne(n._id)}
                className="w-full text-left px-4 py-3 border-b last:border-0 transition-colors"
                style={{
                  borderColor: T.borderSoft,
                  background: n.isRead ? "transparent" : T.tealSoft,
                }}
              >
                <p className="text-sm font-semibold" style={{ color: T.ink }}>{n.title}</p>
                <p className="text-xs mt-0.5 line-clamp-2" style={{ color: T.inkMid }}>
                  {typeof n.message === "string" ? n.message.replace(/<[^>]+>/g, "") : ""}
                </p>
                <p className="text-[10px] mt-1.5" style={{ color: T.inkLight }}>
                  {formatShortDate(n.createdAt)}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
