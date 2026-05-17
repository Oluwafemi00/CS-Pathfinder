// src/pages/Blog.jsx
import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { supabase } from "../config/supabaseClient";
import { useAuth } from "../context/AuthContext";
import Topbar from "../components/Topbar";
import "./Blog.css";

// ── Tiny markdown renderer ────────────────────────────────────────────────────
// Supports: **bold**, *italic*, `code`, # headings, - lists, > blockquote
const renderMarkdown = (text = "") => {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/^&gt; (.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[hublp])/gm, "")
    .trim();
};

// ── Toolbar helper ────────────────────────────────────────────────────────────
const wrapSelection = (textareaRef, before, after, setter) => {
  const el = textareaRef.current;
  if (!el) return;
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const value = el.value;
  const selected = value.substring(start, end) || "text";
  const newValue =
    value.substring(0, start) +
    before +
    selected +
    after +
    value.substring(end);
  setter(newValue);
  setTimeout(() => {
    el.focus();
    el.selectionStart = start + before.length;
    el.selectionEnd = start + before.length + selected.length;
  }, 0);
};

const TOOLBAR = [
  { label: "B", title: "Bold", before: "**", after: "**" },
  { label: "I", title: "Italic", before: "*", after: "*" },
  { label: "</>", title: "Inline code", before: "`", after: "`" },
  { label: "H2", title: "Heading", before: "## ", after: "" },
  { label: "–", title: "List item", before: "- ", after: "" },
  { label: "❝", title: "Blockquote", before: "> ", after: "" },
];

// ── Comments sub-component ────────────────────────────────────────────────────
const Comments = ({ postId, user }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchComments = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch(`http://localhost:5000/api/comments/${postId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) setComments(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchComments();
  }, [open, postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch(`http://localhost:5000/api/comments/${postId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ content: newComment }),
      });
      if (res.ok) {
        const comment = await res.json();
        setComments((prev) => [...prev, comment]);
        setNewComment("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      await fetch(`http://localhost:5000/api/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bl-comments">
      <button className="bl-comments-toggle" onClick={() => setOpen((o) => !o)}>
        <svg
          width="13"
          height="13"
          viewBox="0 0 13 13"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M1.5 2.5A1 1 0 012.5 1.5h8a1 1 0 011 1v5a1 1 0 01-1 1H5l-3 3V7.5h-.5a1 1 0 01-1-1v-4z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
        {open ? "Hide" : "Comments"}{" "}
        {!open && comments.length > 0 ? `(${comments.length})` : ""}
      </button>

      {open && (
        <div className="bl-comments-body">
          {loading ? (
            <p className="bl-comments-loading">Loading comments…</p>
          ) : comments.length === 0 ? (
            <p className="bl-comments-empty">No comments yet. Be the first!</p>
          ) : (
            <div className="bl-comment-list">
              {comments.map((c) => (
                <div key={c.id} className="bl-comment">
                  <div className="bl-comment-avatar">
                    {(c.profiles?.username?.[0] ?? "?").toUpperCase()}
                  </div>
                  <div className="bl-comment-content">
                    <div className="bl-comment-meta">
                      <span className="bl-comment-author">
                        @{c.profiles?.username ?? "Unknown"}
                      </span>
                      <span className="bl-comment-time">
                        {new Date(c.created_at).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="bl-comment-text">{c.content}</p>
                  </div>
                  {c.author_id === user?.id && (
                    <button
                      className="bl-comment-delete"
                      onClick={() => handleDelete(c.id)}
                      aria-label="Delete comment"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M2 2l8 8M10 2l-8 8"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <form className="bl-comment-form" onSubmit={handleSubmit}>
            <input
              type="text"
              className="bl-comment-input"
              placeholder="Write a comment…"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button
              type="submit"
              className="bl-comment-submit"
              disabled={submitting || !newComment.trim()}
            >
              {submitting ? "…" : "Post"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

// ── Main Blog component ───────────────────────────────────────────────────────
const Blog = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [preview, setPreview] = useState(false);
  const textareaRef = useRef(null);

  const fetchPosts = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch("http://localhost:5000/api/blog", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      setPosts(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchPosts();
  }, [user]);

  const handleVote = async (postId, voteValue) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const previousVote = post.userVote ?? 0;
    const newVote = previousVote === voteValue ? 0 : voteValue;
    const delta = newVote - previousVote;

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, score: (p.score ?? 0) + delta, userVote: newVote }
          : p,
      ),
    );

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (newVote === 0) {
        await fetch(`http://localhost:5000/api/blog/${postId}/vote`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
      } else {
        await fetch(`http://localhost:5000/api/blog/${postId}/vote`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ vote_value: newVote }),
        });
      }
    } catch (err) {
      console.error("Vote failed, rolling back:", err);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, score: (p.score ?? 0) - delta, userVote: previousVote }
            : p,
        ),
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    setSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch("http://localhost:5000/api/blog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ title: newTitle, content: newContent }),
      });
      const data = await res.json();
      setMessage({ type: "success", text: data.message });
      setNewTitle("");
      setNewContent("");
      setPreview(false);
      fetchPosts();
      setTimeout(() => setMessage(null), 4000);
    } catch {
      setMessage({ type: "error", text: "Failed to submit article." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bl-layout">
      <Sidebar />
      <main className="bl-main">
        <Topbar
          title="Community Blog"
          subtitle="Read, vote, comment and publish articles curated by the department."
        />

        <div className="bl-body">
          {/* ── Feed ── */}
          <div className="bl-feed">
            {loading ? (
              <div className="bl-loading">
                <div className="bl-spinner" />
                <p>Loading articles…</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="bl-empty">
                <div className="bl-empty-icon">✍️</div>
                <p className="bl-empty-title">No published articles yet</p>
                <p className="bl-empty-sub">
                  Be the first to submit one using the form.
                </p>
              </div>
            ) : (
              posts.map((post) => {
                const userVote = post.userVote ?? 0;
                return (
                  <article key={post.id} className="bl-card">
                    {/* Vote column */}
                    <div className="bl-vote-col" aria-label="Voting">
                      <button
                        className={`bl-vote-btn bl-vote-up ${userVote === 1 ? "bl-vote-active-up" : ""}`}
                        onClick={() => handleVote(post.id, 1)}
                        aria-label="Upvote"
                        aria-pressed={userVote === 1}
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 13 13"
                          fill="none"
                        >
                          <path
                            d="M6.5 2l4.5 7H2L6.5 2z"
                            stroke="currentColor"
                            strokeWidth="1.3"
                            strokeLinejoin="round"
                            fill={userVote === 1 ? "currentColor" : "none"}
                          />
                        </svg>
                      </button>
                      <span
                        className="bl-vote-score"
                        style={{
                          color:
                            userVote === 1
                              ? "#34d399"
                              : userVote === -1
                                ? "#fca5a5"
                                : "#e2e8f0",
                        }}
                      >
                        {post.score ?? 0}
                      </span>
                      <button
                        className={`bl-vote-btn bl-vote-down ${userVote === -1 ? "bl-vote-active-down" : ""}`}
                        onClick={() => handleVote(post.id, -1)}
                        aria-label="Downvote"
                        aria-pressed={userVote === -1}
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 13 13"
                          fill="none"
                        >
                          <path
                            d="M6.5 11L2 4h9L6.5 11z"
                            stroke="currentColor"
                            strokeWidth="1.3"
                            strokeLinejoin="round"
                            fill={userVote === -1 ? "currentColor" : "none"}
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Content */}
                    <div className="bl-content-col">
                      <h2 className="bl-card-title">{post.title}</h2>
                      <div className="bl-card-meta">
                        <span>@{post.profiles?.username ?? "Unknown"}</span>
                        <span className="bl-meta-dot">·</span>
                        <span>
                          {new Date(post.created_at).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      {/* Rendered markdown body */}
                      <div
                        className={`bl-card-body ${expanded === post.id ? "expanded" : ""}`}
                        dangerouslySetInnerHTML={{
                          __html: renderMarkdown(post.content),
                        }}
                      />
                      {post.content?.length > 220 && (
                        <button
                          className="bl-read-more"
                          onClick={() =>
                            setExpanded(expanded === post.id ? null : post.id)
                          }
                        >
                          {expanded === post.id ? "Show less" : "Read more"}
                        </button>
                      )}

                      {/* Comments */}
                      <Comments postId={post.id} user={user} />
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {/* ── Write form ── */}
          <aside className="bl-sidebar">
            <div className="bl-form-card">
              <h3 className="bl-form-title">Write an article</h3>
              <p className="bl-form-sub">
                Supports markdown. Submissions are reviewed before publishing.
              </p>

              {message && (
                <div className={`bl-message ${message.type}`} role="alert">
                  {message.type === "success" ? "✅" : "❌"} {message.text}
                </div>
              )}

              <form className="bl-form" onSubmit={handleSubmit}>
                <div className="bl-form-field">
                  <label className="bl-form-label" htmlFor="bl-title">
                    Title
                  </label>
                  <input
                    id="bl-title"
                    type="text"
                    className="bl-form-input"
                    placeholder="What's your article about?"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="bl-form-field">
                  {/* Toolbar + preview toggle */}
                  <div className="bl-editor-header">
                    <label className="bl-form-label" htmlFor="bl-content">
                      Content
                    </label>
                    <div className="bl-editor-controls">
                      {!preview &&
                        TOOLBAR.map((t) => (
                          <button
                            key={t.label}
                            type="button"
                            title={t.title}
                            className="bl-toolbar-btn"
                            onClick={() =>
                              wrapSelection(
                                textareaRef,
                                t.before,
                                t.after,
                                setNewContent,
                              )
                            }
                          >
                            {t.label}
                          </button>
                        ))}
                      <button
                        type="button"
                        className={`bl-preview-btn ${preview ? "active" : ""}`}
                        onClick={() => setPreview((p) => !p)}
                      >
                        {preview ? "Edit" : "Preview"}
                      </button>
                    </div>
                  </div>

                  {preview ? (
                    <div
                      className="bl-preview-pane"
                      dangerouslySetInnerHTML={{
                        __html:
                          renderMarkdown(newContent) ||
                          "<p style='color:#475569'>Nothing to preview yet…</p>",
                      }}
                    />
                  ) : (
                    <textarea
                      id="bl-content"
                      ref={textareaRef}
                      className="bl-form-textarea"
                      placeholder={`Share your knowledge…\n\nTips:\n**bold**, *italic*, \`code\`\n# Heading\n- List item\n> Blockquote`}
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      rows={10}
                      required
                    />
                  )}
                </div>

                <button
                  type="submit"
                  className="bl-submit-btn"
                  disabled={
                    submitting || !newTitle.trim() || !newContent.trim()
                  }
                >
                  {submitting ? (
                    <>
                      <span className="bl-btn-spinner" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      Submit for review
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M3 8h10M9 4l4 4-4 4"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Blog;
