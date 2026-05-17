// src/pages/Community.jsx
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../config/supabaseClient";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "./Community.css";

const Community = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const feedRef = useRef(null);
  const textareaRef = useRef(null);

  const fetchPosts = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const res = await fetch("http://localhost:5000/api/community", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch posts");
      setPosts(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchPosts(true);

    const channel = supabase
      .channel("community-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "community_posts",
        },
        () => fetchPosts(false),
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  // Auto-scroll to bottom on new posts
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [posts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || sending) return;

    setSending(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch("http://localhost:5000/api/community", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ user_id: user.id, content }),
      });
      if (!res.ok) throw new Error("Failed to post");
      setContent("");
      fetchPosts(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  // Cmd/Ctrl + Enter to submit
  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleSubmit(e);
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (ts) => {
    const d = new Date(ts);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Today";
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  // Group posts by date
  const grouped = posts.reduce((acc, post) => {
    const label = formatDate(post.created_at);
    if (!acc[label]) acc[label] = [];
    acc[label].push(post);
    return acc;
  }, {});

  return (
    <div className="cm-layout">
      <Sidebar />

      <div className="cm-main">
        {/* Topbar */}
        <Topbar
          title="Department Chat"
          subtitle="Share resources, ask questions, and collaborate with your cohort."
        />
        <div className="cm-live-row">
          <div className="cm-live-badge">
            <span className="cm-live-dot" aria-hidden="true" />
            Live
          </div>
        </div>

        {/* Feed */}
        <div className="cm-feed" ref={feedRef}>
          {loading ? (
            <div className="cm-loading">
              <div className="cm-spinner" aria-label="Loading posts" />
              <p>Loading messages…</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="cm-empty">
              <div className="cm-empty-icon" aria-hidden="true">
                💬
              </div>
              <p className="cm-empty-title">No messages yet</p>
              <p className="cm-empty-sub">
                Be the first to start the conversation!
              </p>
            </div>
          ) : (
            Object.entries(grouped).map(([date, datePosts]) => (
              <div key={date} className="cm-date-group">
                <div className="cm-date-label">
                  <span>{date}</span>
                </div>
                {datePosts.map((post) => {
                  const isMe =
                    post.profiles?.username === user?.user_metadata?.username;
                  return (
                    <div
                      key={post.id}
                      className={`cm-post ${isMe ? "cm-post-me" : ""}`}
                    >
                      <div className="cm-avatar" aria-hidden="true">
                        {(post.profiles?.username?.[0] ?? "?").toUpperCase()}
                      </div>
                      <div className="cm-post-body">
                        <div className="cm-post-meta">
                          <span className="cm-post-author">
                            @{post.profiles?.username ?? "Unknown"}
                          </span>
                          <span className="cm-post-time">
                            {formatTime(post.created_at)}
                          </span>
                        </div>
                        <div className="cm-post-content">{post.content}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Composer */}
        <div className="cm-composer">
          <form className="cm-composer-form" onSubmit={handleSubmit}>
            <textarea
              ref={textareaRef}
              className="cm-composer-input"
              placeholder="Share something with the department…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <div className="cm-composer-footer">
              <span className="cm-composer-hint">
                <kbd>⌘</kbd> + <kbd>Enter</kbd> to send
              </span>
              <button
                type="submit"
                className="cm-send-btn"
                disabled={!content.trim() || sending}
              >
                {sending ? (
                  <span className="cm-send-spinner" aria-hidden="true" />
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 8l12-6-6 12V8H2z"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {sending ? "Sending…" : "Send"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Community;
