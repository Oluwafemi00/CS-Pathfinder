// src/pages/Profile.jsx
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../hooks/useProfile";
import { supabase } from "../config/supabaseClient";
import Topbar from "../components/Topbar";
import "./Profile.css";

const Profile = () => {
  const { user } = useAuth();
  const { profile, loadingProfile } = useProfile(user?.id);
  const [myPosts, setMyPosts] = useState([]);
  const [myVotes, setMyVotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;

        const headers = { Authorization: `Bearer ${session.access_token}` };
        const [postsRes, votesRes] = await Promise.all([
          fetch("http://localhost:5000/api/blog/me/posts", { headers }),
          fetch("http://localhost:5000/api/blog/me/votes", { headers }),
        ]);

        if (postsRes.ok) setMyPosts(await postsRes.json());
        if (votesRes.ok) setMyVotes(await votesRes.json());
      } catch (err) {
        console.error("Error fetching profile data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  const handleResetPassword = async () => {
    if (!user?.email) return;
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
      setResetSent(true);
      setTimeout(() => setResetSent(false), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setResetLoading(false);
    }
  };

  const STATUS_META = {
    published: {
      label: "Published",
      color: "#6ee7b7",
      bg: "rgba(16,185,129,0.1)",
      border: "rgba(16,185,129,0.25)",
    },
    pending: {
      label: "Pending",
      color: "#fcd34d",
      bg: "rgba(245,158,11,0.1)",
      border: "rgba(245,158,11,0.25)",
    },
    rejected: {
      label: "Rejected",
      color: "#fca5a5",
      bg: "rgba(239,68,68,0.1)",
      border: "rgba(239,68,68,0.25)",
    },
  };

  return (
    <div className="pr-layout">
      <Sidebar />

      <main className="pr-main">
        <Topbar
          title="My Profile"
          subtitle="Manage your account and view your activity."
        />

        {/* ── ACCOUNT CARD ── */}
        <div className="pr-account-card">
          <div className="pr-account-left">
            <div className="pr-big-avatar">
              {loadingProfile
                ? "…"
                : (profile?.username?.[0] ?? "U").toUpperCase()}
            </div>
            <div>
              <div className="pr-account-name">
                {loadingProfile ? "Loading…" : `@${profile?.username}`}
              </div>
              <div className="pr-account-email">{user?.email}</div>
              {profile?.role === "admin" && (
                <span className="pr-role-badge">Admin</span>
              )}
            </div>
          </div>

          <div className="pr-account-goal">
            <div className="pr-goal-label">My goal</div>
            <div className="pr-goal-text">
              {loadingProfile
                ? "…"
                : profile?.expectations || "No goal set yet."}
            </div>
          </div>

          <button
            className="pr-reset-btn"
            onClick={handleResetPassword}
            disabled={resetLoading || resetSent}
          >
            {resetSent ? (
              <>
                <span aria-hidden="true">✅</span> Email sent!
              </>
            ) : resetLoading ? (
              <>
                <span className="pr-spinner" aria-hidden="true" />
                Sending…
              </>
            ) : (
              <>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <rect
                    x="3"
                    y="7"
                    width="10"
                    height="7"
                    rx="1.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M5 7V5a3 3 0 016 0v2"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
                Reset password
              </>
            )}
          </button>
        </div>

        {/* ── ACTIVITY GRID ── */}
        {isLoading ? (
          <div className="pr-loading">
            <div className="pr-load-spinner" aria-label="Loading activity" />
            <p>Loading activity…</p>
          </div>
        ) : (
          <div className="pr-activity-grid">
            {/* My submissions */}
            <div className="pr-activity-card">
              <div className="pr-activity-header">
                <h2 className="pr-activity-title">My submissions</h2>
                <span className="pr-activity-count">{myPosts.length}</span>
              </div>

              {myPosts.length === 0 ? (
                <p className="pr-activity-empty">
                  You haven't submitted any articles yet.
                </p>
              ) : (
                <div className="pr-activity-list">
                  {myPosts.map((post) => {
                    const meta =
                      STATUS_META[post.status] || STATUS_META.pending;
                    return (
                      <div key={post.id} className="pr-item">
                        <div className="pr-item-body">
                          <span className="pr-item-title">{post.title}</span>
                          <span className="pr-item-date">
                            {new Date(post.created_at).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <span
                          className="pr-status-badge"
                          style={{
                            color: meta.color,
                            background: meta.bg,
                            border: `1px solid ${meta.border}`,
                          }}
                        >
                          {meta.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* My voting history */}
            <div className="pr-activity-card">
              <div className="pr-activity-header">
                <h2 className="pr-activity-title">Voting history</h2>
                <span className="pr-activity-count">{myVotes.length}</span>
              </div>

              {myVotes.length === 0 ? (
                <p className="pr-activity-empty">
                  You haven't voted on any articles yet.
                </p>
              ) : (
                <div className="pr-activity-list">
                  {myVotes.map((vote, i) => (
                    <div key={i} className="pr-item pr-vote-item">
                      <span
                        className="pr-vote-arrow"
                        style={{
                          color: vote.vote_value === 1 ? "#34d399" : "#fca5a5",
                        }}
                        aria-label={
                          vote.vote_value === 1 ? "Upvote" : "Downvote"
                        }
                      >
                        {vote.vote_value === 1 ? "▲" : "▼"}
                      </span>
                      <div className="pr-item-body">
                        <span className="pr-item-title">
                          {vote.blog_posts?.title ?? "Untitled"}
                        </span>
                        <span className="pr-item-date">
                          by @{vote.blog_posts?.profiles?.username ?? "Unknown"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
