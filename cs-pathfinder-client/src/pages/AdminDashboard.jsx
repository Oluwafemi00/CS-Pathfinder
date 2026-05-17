// src/pages/AdminDashboard.jsx
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { supabase } from "../config/supabaseClient";
import Topbar from "../components/Topbar";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [pendingPosts, setPendingPosts] = useState([]);
  const [availablePaths, setAvailablePaths] = useState([]);
  const [activeTab, setActiveTab] = useState("paths");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const [pathForm, setPathForm] = useState({
    title: "",
    description: "",
    difficulty: "Beginner",
    about: "",
  });

  const [resourceForm, setResourceForm] = useState({
    path_id: "",
    title: "",
    resource_type: "Interactive Course",
    url: "",
    description: "",
  });

  const fetchData = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const headers = { Authorization: `Bearer ${session.access_token}` };
      const [postsRes, pathsRes] = await Promise.all([
        fetch("http://localhost:5000/api/blog/pending", { headers }),
        fetch("http://localhost:5000/api/paths", { headers }),
      ]);
      if (postsRes.ok) setPendingPosts(await postsRes.json());
      if (pathsRes.ok) {
        const paths = await pathsRes.json();
        setAvailablePaths(paths);
        if (paths.length > 0 && !resourceForm.path_id) {
          setResourceForm((p) => ({ ...p, path_id: paths[0].id.toString() }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch admin data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleAddPath = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch("http://localhost:5000/api/admin/paths", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(pathForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showMessage(data.message);
      setPathForm({
        title: "",
        description: "",
        difficulty: "Beginner",
        about: "",
      });
      fetchData();
    } catch (err) {
      showMessage(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch("http://localhost:5000/api/admin/resources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(resourceForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showMessage(data.message);
      setResourceForm((p) => ({ ...p, title: "", url: "", description: "" }));
    } catch (err) {
      showMessage(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePostStatus = async (id, status) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      await fetch(`http://localhost:5000/api/blog/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ status }),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const TABS = [
    { id: "paths", label: "Create Path" },
    { id: "resources", label: "Add Resource" },
    {
      id: "moderate",
      label: `Moderation${pendingPosts.length > 0 ? ` (${pendingPosts.length})` : ""}`,
    },
  ];

  return (
    <div className="ad-layout">
      <Sidebar />

      <main className="ad-main">
        <Topbar
          title="Control Centre"
          subtitle="Manage paths, resources, and moderate community content."
        />

        {/* Global message */}
        {message && (
          <div className={`ad-message ${message.type}`} role="alert">
            {message.type === "success" ? "✅" : "❌"} {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="ad-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`ad-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB: Create Path ── */}
        {activeTab === "paths" && (
          <div className="ad-form-card">
            <h2 className="ad-form-title">Create a new curriculum path</h2>
            <form className="ad-form" onSubmit={handleAddPath}>
              <div className="ad-field-row">
                <div className="ad-field">
                  <label className="ad-label">Path title</label>
                  <input
                    type="text"
                    className="ad-input"
                    placeholder="e.g. UI/UX Mastery"
                    value={pathForm.title}
                    onChange={(e) =>
                      setPathForm({ ...pathForm, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="ad-field">
                  <label className="ad-label">Difficulty</label>
                  <select
                    className="ad-input ad-select"
                    value={pathForm.difficulty}
                    onChange={(e) =>
                      setPathForm({ ...pathForm, difficulty: e.target.value })
                    }
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="ad-field">
                <label className="ad-label">Short description</label>
                <textarea
                  className="ad-textarea"
                  placeholder="A brief overview shown on the Explore page…"
                  value={pathForm.description}
                  onChange={(e) =>
                    setPathForm({ ...pathForm, description: e.target.value })
                  }
                  rows={3}
                  required
                />
              </div>

              <div className="ad-field">
                <label className="ad-label">
                  Detailed about section
                  <span className="ad-label-hint">shown in expanded view</span>
                </label>
                <textarea
                  className="ad-textarea"
                  placeholder="What will students learn? What are the prerequisites?…"
                  value={pathForm.about}
                  onChange={(e) =>
                    setPathForm({ ...pathForm, about: e.target.value })
                  }
                  rows={5}
                  required
                />
              </div>

              <button
                type="submit"
                className="ad-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="ad-spinner" aria-hidden="true" />
                    Creating…
                  </>
                ) : (
                  "Create path →"
                )}
              </button>
            </form>
          </div>
        )}

        {/* ── TAB: Add Resource ── */}
        {activeTab === "resources" && (
          <div className="ad-form-card">
            <h2 className="ad-form-title">Add a resource to a path</h2>
            <form className="ad-form" onSubmit={handleAddResource}>
              <div className="ad-field-row">
                <div className="ad-field">
                  <label className="ad-label">Assign to path</label>
                  <select
                    className="ad-input ad-select"
                    value={resourceForm.path_id}
                    onChange={(e) =>
                      setResourceForm({
                        ...resourceForm,
                        path_id: e.target.value,
                      })
                    }
                    required
                  >
                    {availablePaths.length === 0 ? (
                      <option value="">No paths yet — create one first</option>
                    ) : (
                      availablePaths.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} ({p.difficulty})
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div className="ad-field">
                  <label className="ad-label">Resource type</label>
                  <select
                    className="ad-input ad-select"
                    value={resourceForm.resource_type}
                    onChange={(e) =>
                      setResourceForm({
                        ...resourceForm,
                        resource_type: e.target.value,
                      })
                    }
                  >
                    <option value="Interactive Course">
                      Interactive Course
                    </option>
                    <option value="Article">Article</option>
                    <option value="Project">Project</option>
                    <option value="Video">Video</option>
                  </select>
                </div>
              </div>

              <div className="ad-field-row">
                <div className="ad-field">
                  <label className="ad-label">Resource title</label>
                  <input
                    type="text"
                    className="ad-input"
                    placeholder="e.g. React 19 — Concurrent rendering"
                    value={resourceForm.title}
                    onChange={(e) =>
                      setResourceForm({
                        ...resourceForm,
                        title: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="ad-field">
                  <label className="ad-label">URL</label>
                  <input
                    type="url"
                    className="ad-input"
                    placeholder="https://…"
                    value={resourceForm.url}
                    onChange={(e) =>
                      setResourceForm({ ...resourceForm, url: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="ad-field">
                <label className="ad-label">Description</label>
                <textarea
                  className="ad-textarea"
                  placeholder="What will students learn from this resource?…"
                  value={resourceForm.description}
                  onChange={(e) =>
                    setResourceForm({
                      ...resourceForm,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  required
                />
              </div>

              <button
                type="submit"
                className="ad-submit-btn"
                disabled={loading || availablePaths.length === 0}
              >
                {loading ? (
                  <>
                    <span className="ad-spinner" aria-hidden="true" />
                    Publishing…
                  </>
                ) : (
                  "Publish resource →"
                )}
              </button>
            </form>
          </div>
        )}

        {/* ── TAB: Moderation ── */}
        {activeTab === "moderate" && (
          <div className="ad-moderation">
            <div className="ad-mod-header">
              <h2 className="ad-form-title">Pending approvals</h2>
              <span className="ad-mod-count">
                {pendingPosts.length} in queue
              </span>
            </div>

            {pendingPosts.length === 0 ? (
              <div className="ad-mod-empty">
                <div className="ad-mod-empty-icon" aria-hidden="true">
                  ✅
                </div>
                <p>All clear — no pending articles.</p>
              </div>
            ) : (
              <div className="ad-mod-list">
                {pendingPosts.map((post) => (
                  <div key={post.id} className="ad-mod-card">
                    <div className="ad-mod-meta">
                      <span className="ad-mod-author">
                        @{post.profiles?.username}
                      </span>
                      <span className="ad-mod-date">
                        {new Date(post.created_at).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <h3 className="ad-mod-title">{post.title}</h3>
                    <p className="ad-mod-body">{post.content}</p>
                    <div className="ad-mod-actions">
                      <button
                        className="ad-mod-btn approve"
                        onClick={() => handlePostStatus(post.id, "published")}
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 13 13"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M2 6.5l3 3 6-6"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Approve & publish
                      </button>
                      <button
                        className="ad-mod-btn reject"
                        onClick={() => handlePostStatus(post.id, "rejected")}
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 13 13"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M3 3l7 7M10 3l-7 7"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
