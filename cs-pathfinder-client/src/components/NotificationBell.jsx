// src/components/NotificationBell.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../hooks/useNotifications";
import { useAuth } from "../context/AuthContext";
import "./NotificationBell.css";

const TYPE_ICON = {
  post_approved: "🎉",
  post_rejected: "❌",
  new_comment: "💬",
};

const NotificationBell = () => {
  const { user } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } =
    useNotifications(user);
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleClick = (notif) => {
    markRead(notif.id);
    if (notif.link) navigate(notif.link);
    setOpen(false);
  };

  const formatTime = (ts) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="nb-root" ref={panelRef}>
      {/* Bell button */}
      <button
        className="nb-bell"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 17 17"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M8.5 1.5a5.5 5.5 0 015.5 5.5c0 2.5.5 4 1.5 5H1.5c1-1 1.5-2.5 1.5-5A5.5 5.5 0 018.5 1.5z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path
            d="M6.5 14.5a2 2 0 004 0"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="nb-badge" aria-hidden="true">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="nb-panel" role="dialog" aria-label="Notifications">
          <div className="nb-panel-header">
            <span className="nb-panel-title">Notifications</span>
            {unreadCount > 0 && (
              <button className="nb-mark-all" onClick={markAllRead}>
                Mark all read
              </button>
            )}
          </div>

          <div className="nb-list">
            {notifications.length === 0 ? (
              <div className="nb-empty">
                <span aria-hidden="true">🔔</span>
                <p>You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <button
                  key={notif.id}
                  className={`nb-item ${!notif.is_read ? "nb-item-unread" : ""}`}
                  onClick={() => handleClick(notif)}
                >
                  <span className="nb-item-icon" aria-hidden="true">
                    {TYPE_ICON[notif.type] ?? "🔔"}
                  </span>
                  <div className="nb-item-body">
                    <p className="nb-item-message">{notif.message}</p>
                    <span className="nb-item-time">
                      {formatTime(notif.created_at)}
                    </span>
                  </div>
                  {!notif.is_read && (
                    <span className="nb-unread-dot" aria-hidden="true" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
