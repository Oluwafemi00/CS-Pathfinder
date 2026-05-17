// src/pages/Explore.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { supabase } from "../config/supabaseClient";
import Topbar from "../components/Topbar";
import "./Explore.css";

const DIFFICULTY_META = {
  Beginner: { color: "#6ee7b7", bg: "rgba(16,185,129,0.12)", dot: "#10b981" },
  Intermediate: {
    color: "#fcd34d",
    bg: "rgba(245,158,11,0.12)",
    dot: "#f59e0b",
  },
  Advanced: { color: "#fca5a5", bg: "rgba(239,68,68,0.12)", dot: "#ef4444" },
};

const Explore = () => {
  const [paths, setPaths] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null);
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPaths = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;
        const res = await fetch("http://localhost:5000/api/paths", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) setPaths(await res.json());
      } catch (err) {
        console.error("Error fetching paths:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPaths();
  }, []);

  const handleEnroll = async (pathId) => {
    setEnrollingId(pathId);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch(
        `http://localhost:5000/api/paths/${pathId}/enroll`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}` },
        },
      );
      if (res.ok) {
        navigate(`/dashboard?path=${pathId}`);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to enrol.");
      }
    } catch (err) {
      console.error("Enrolment error:", err);
    } finally {
      setEnrollingId(null);
    }
  };

  const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

  const filtered = paths.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = filter === "All" || p.difficulty === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="ex-layout">
      <Sidebar />

      <main className="ex-main">
        <Topbar
          title="Explore Paths"
          subtitle="Structured learning tracks curated by the department."
        />

        {/* Search + Filter bar */}
        <div className="ex-controls">
          <div className="ex-search-wrap">
            <svg
              className="ex-search-icon"
              width="15"
              height="15"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="6.5"
                cy="6.5"
                r="5"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <path
                d="M10.5 10.5l3.5 3.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="search"
              className="ex-search"
              placeholder="Search paths…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="ex-filters">
            {difficulties.map((d) => (
              <button
                key={d}
                onClick={() => setFilter(d)}
                className={`ex-filter-btn ${filter === d ? "active" : ""}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="ex-loading">
            <div className="ex-spinner" aria-label="Loading paths" />
            <p>Loading catalogue…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="ex-empty">
            <p className="ex-empty-title">No paths found</p>
            <p className="ex-empty-sub">Try a different search or filter.</p>
          </div>
        ) : (
          <div className="ex-grid">
            {filtered.map((path) => {
              const meta =
                DIFFICULTY_META[path.difficulty] || DIFFICULTY_META.Beginner;
              return (
                <div key={path.id} className="ex-card">
                  {/* Top badges */}
                  <div className="ex-card-top">
                    <span
                      className="ex-badge"
                      style={{ background: meta.bg, color: meta.color }}
                    >
                      <span
                        className="ex-badge-dot"
                        style={{ background: meta.dot }}
                      />
                      {path.difficulty}
                    </span>
                    <span className="ex-modules-badge">
                      {path.resourceCount ?? 0} modules
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="ex-card-title">{path.title}</h3>
                  <p className="ex-card-desc">{path.description}</p>

                  {/* Enrol button */}
                  <button
                    className="ex-enrol-btn"
                    onClick={() => handleEnroll(path.id)}
                    disabled={enrollingId === path.id}
                  >
                    {enrollingId === path.id ? (
                      <>
                        <span className="ex-btn-spinner" aria-hidden="true" />
                        Enrolling…
                      </>
                    ) : (
                      <>
                        Start learning
                        <svg
                          width="14"
                          height="14"
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
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Explore;
