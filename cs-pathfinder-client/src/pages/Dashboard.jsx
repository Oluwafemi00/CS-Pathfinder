// src/pages/Dashboard.jsx
import { useState, useEffect, useRef } from "react";
import {
  Link,
  useLocation,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import { supabase } from "../config/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../hooks/useProfile";
import { useStreak } from "../hooks/useStreak";
import Sidebar from "../components/Sidebar";
import ActivityHeatmap from "../components/ActivityHeatmap";
import PathCompletionScreen from "../components/PathCompletionScreen";
import Topbar from "../components/Topbar";
import "./Dashboard.css";

const RESOURCE_TAG_COLORS = {
  "Interactive Course": { bg: "rgba(59,130,246,0.12)", color: "#93c5fd" },
  Article: { bg: "rgba(16,185,129,0.12)", color: "#6ee7b7" },
  Project: { bg: "rgba(245,158,11,0.12)", color: "#fcd34d" },
  Video: { bg: "rgba(168,85,247,0.12)", color: "#d8b4fe" },
};

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const { streak, totalDone, activityDates } = useStreak(user);

  const [enrolledPaths, setEnrolledPaths] = useState([]);
  const [pathInfo, setPathInfo] = useState(null);
  const [resources, setResources] = useState([]);
  const [completedIds, setCompletedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWelcome, setShowWelcome] = useState(
    location.state?.isNewUser || false,
  );
  const [showCompletion, setShowCompletion] = useState(false);

  // Track whether we've already shown the completion screen this session
  const completionShownRef = useRef(false);

  const closeWelcome = () => {
    setShowWelcome(false);
    window.history.replaceState({}, document.title);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        const headers = { Authorization: `Bearer ${session.access_token}` };

        const enrollmentsRes = await fetch(
          "http://localhost:5000/api/paths/me/enrolled",
          { headers },
        );
        if (!enrollmentsRes.ok) throw new Error("Failed to fetch enrollments.");
        const enrollmentsData = await enrollmentsRes.json();
        setEnrolledPaths(enrollmentsData);

        if (enrollmentsData.length === 0) {
          setIsLoading(false);
          return;
        }

        let activePathId = searchParams.get("path");
        const enrolled = enrollmentsData.some(
          (p) => p.id.toString() === activePathId,
        );

        if (!activePathId || !enrolled) {
          activePathId = enrollmentsData[0].id.toString();
          navigate(`/dashboard?path=${activePathId}`, { replace: true });
        }

        const [pathRes, resourcesRes, progressRes] = await Promise.all([
          fetch(`http://localhost:5000/api/paths/${activePathId}`, { headers }),
          fetch(`http://localhost:5000/api/paths/${activePathId}/resources`, {
            headers,
          }),
          fetch("http://localhost:5000/api/progress", { headers }),
        ]);

        if (!pathRes.ok || !resourcesRes.ok || !progressRes.ok)
          throw new Error("Failed to fetch path data.");

        setPathInfo(await pathRes.json());
        const resourceData = await resourcesRes.json();
        setResources(resourceData);
        const progressData = await progressRes.json();
        const ids = Array.isArray(progressData) ? progressData : [];
        setCompletedIds(ids);

        // Show completion screen if 100% and not shown yet this session
        if (
          resourceData.length > 0 &&
          ids.length >= resourceData.length &&
          !completionShownRef.current
        ) {
          completionShownRef.current = true;
          setShowCompletion(true);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchData();
  }, [user, searchParams.get("path")]);

  const handleToggleComplete = async (resourceId) => {
    const isNowComplete = !completedIds.includes(resourceId);

    const newIds = isNowComplete
      ? [...completedIds, resourceId]
      : completedIds.filter((id) => id !== resourceId);

    setCompletedIds(newIds);

    // Show completion screen when user finishes the last resource
    if (
      isNowComplete &&
      newIds.length === resources.length &&
      !completionShownRef.current
    ) {
      completionShownRef.current = true;
      setTimeout(() => setShowCompletion(true), 600);
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      await fetch("http://localhost:5000/api/progress/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          resource_id: resourceId,
          is_completed: isNowComplete,
        }),
      });
    } catch {
      // silently fail — optimistic UI already updated
    }
  };

  const progressPct =
    resources.length > 0
      ? Math.round((completedIds.length / resources.length) * 100)
      : 0;

  const activePathId = searchParams.get("path");

  return (
    <div className="dash-layout">
      {/* ── Path completion screen ── */}
      {showCompletion && pathInfo && (
        <PathCompletionScreen
          pathTitle={pathInfo.title}
          username={profile?.username || "Student"}
          onDismiss={() => setShowCompletion(false)}
        />
      )}

      {/* ── Welcome modal ── */}
      {showWelcome && (
        <div
          className="dash-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-title"
        >
          <div className="dash-modal">
            <div className="dash-modal-icon" aria-hidden="true">
              🚀
            </div>
            <h2 id="welcome-title" className="dash-modal-title">
              Welcome, {profile?.username || "Student"}!
            </h2>
            <p className="dash-modal-body">
              Your learning journey starts right now. Head to{" "}
              <strong>Explore Paths</strong> to enrol in your first curriculum
              and start tracking your progress.
            </p>
            <button className="dash-modal-btn" onClick={closeWelcome}>
              Let's go
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <Sidebar />

      <main className="dash-main">
        <Topbar
          title={pathInfo?.title || "My Dashboard"}
          subtitle={pathInfo?.description}
        />
        {isLoading ? (
          <div className="dash-loading">
            <div className="dash-spinner" aria-label="Loading" />
            <p>Loading your curriculum…</p>
          </div>
        ) : error ? (
          <div className="dash-error">
            <svg
              width="20"
              height="20"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="8"
                cy="8"
                r="7"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M8 5v3.5M8 11h.01"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            {error}
          </div>
        ) : enrolledPaths.length === 0 ? (
          <div className="dash-empty">
            <div className="dash-empty-icon" aria-hidden="true">
              🗺
            </div>
            <h2 className="dash-empty-title">Your journey awaits</h2>
            <p className="dash-empty-body">
              You haven't enrolled in any curriculum tracks yet. Explore our
              catalogue and pick a path that matches your goals.
            </p>
            <Link to="/explore" className="dash-empty-cta">
              Browse all paths
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        ) : (
          <>
            {/* ── Path switcher ── */}
            {enrolledPaths.length > 1 && (
              <div className="dash-path-tabs">
                {enrolledPaths.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      completionShownRef.current = false;
                      navigate(`/dashboard?path=${p.id}`);
                    }}
                    className={`dash-path-tab ${activePathId === p.id.toString() ? "active" : ""}`}
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            )}

            {/* ── Stats row ── */}
            <div className="dash-stats">
              <div className="dash-stat">
                <span className="dash-stat-label">Progress</span>
                <span className="dash-stat-value">{progressPct}%</span>
              </div>
              <div className="dash-stat">
                <span className="dash-stat-label">Completed</span>
                <span className="dash-stat-value dash-stat-green">
                  {completedIds.length}
                  <span className="dash-stat-denom"> / {resources.length}</span>
                </span>
              </div>
              <div className="dash-stat">
                <span className="dash-stat-label">Day streak</span>
                <span
                  className="dash-stat-value"
                  style={{ color: streak > 0 ? "#fcd34d" : undefined }}
                >
                  {streak > 0 ? `🔥 ${streak}` : streak}
                </span>
              </div>
              <div className="dash-stat">
                <span className="dash-stat-label">Total done</span>
                <span className="dash-stat-value">{totalDone}</span>
              </div>
            </div>

            {/* ── Progress bar ── */}
            <div className="dash-progress-wrap">
              <div className="dash-progress-track">
                <div
                  className="dash-progress-fill"
                  style={{ width: `${progressPct}%` }}
                  role="progressbar"
                  aria-valuenow={progressPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              {progressPct === 100 && (
                <span className="dash-progress-badge">Complete 🎉</span>
              )}
            </div>

            {/* ── Activity heatmap ── */}
            {activityDates.length > 0 && (
              <div className="dash-heatmap-wrap">
                <div className="dash-heatmap-header">
                  <span className="dash-heatmap-label">
                    Activity — last 12 weeks
                  </span>
                </div>
                <ActivityHeatmap activityDates={activityDates} />
              </div>
            )}

            {/* ── Resources ── */}
            {resources.length === 0 ? (
              <p className="dash-no-resources">
                No resources added to this path yet.
              </p>
            ) : (
              <div className="dash-resource-grid">
                {resources.map((resource) => {
                  const isCompleted = completedIds.includes(resource.id);
                  const tagStyle = RESOURCE_TAG_COLORS[
                    resource.resource_type
                  ] || {
                    bg: "rgba(255,255,255,0.08)",
                    color: "#94a3b8",
                  };

                  return (
                    <div
                      key={resource.id}
                      className={`dash-resource-card ${isCompleted ? "dash-resource-done" : ""}`}
                    >
                      <div className="dash-resource-top">
                        <span
                          className="dash-resource-tag"
                          style={{
                            background: tagStyle.bg,
                            color: tagStyle.color,
                          }}
                        >
                          {resource.resource_type}
                        </span>
                        {isCompleted && (
                          <span
                            className="dash-resource-check"
                            aria-label="Completed"
                          >
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 13 13"
                              fill="none"
                            >
                              <circle
                                cx="6.5"
                                cy="6.5"
                                r="6"
                                fill="rgba(16,185,129,0.15)"
                                stroke="rgba(16,185,129,0.4)"
                                strokeWidth="0.75"
                              />
                              <path
                                d="M4 6.5l2 2 3-3"
                                stroke="#34d399"
                                strokeWidth="1.3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        )}
                      </div>

                      <h3 className="dash-resource-title">{resource.title}</h3>
                      <p className="dash-resource-desc">
                        {resource.description}
                      </p>

                      <div className="dash-resource-actions">
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="dash-resource-start"
                        >
                          Open resource
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 13 13"
                            fill="none"
                            aria-hidden="true"
                          >
                            <path
                              d="M2 11L11 2M11 2H6M11 2v5"
                              stroke="currentColor"
                              strokeWidth="1.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </a>
                        <button
                          onClick={() => handleToggleComplete(resource.id)}
                          className={`dash-resource-toggle ${isCompleted ? "done" : ""}`}
                        >
                          {isCompleted ? "Mark undone" : "Mark done"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
