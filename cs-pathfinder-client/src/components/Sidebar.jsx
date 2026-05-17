// src/components/Sidebar.jsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../config/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../hooks/useProfile";
import "./Sidebar.css";

const NAV = [
  {
    section: "Learning",
    links: [
      {
        to: "/dashboard",
        label: "My Dashboard",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect
              x="1"
              y="1"
              width="6"
              height="6"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <rect
              x="9"
              y="1"
              width="6"
              height="6"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <rect
              x="1"
              y="9"
              width="6"
              height="6"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <rect
              x="9"
              y="9"
              width="6"
              height="6"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.4"
            />
          </svg>
        ),
      },
      {
        to: "/explore",
        label: "Explore Paths",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle
              cx="8"
              cy="8"
              r="6.5"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <path
              d="M10.5 5.5l-2 5-3-3 5-2z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        ),
      },
    ],
  },
  {
    section: "Community",
    links: [
      {
        to: "/community",
        label: "Department Chat",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M2 3.5A1.5 1.5 0 013.5 2h9A1.5 1.5 0 0114 3.5v6A1.5 1.5 0 0112.5 11H9l-3 3v-3H3.5A1.5 1.5 0 012 9.5v-6z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        ),
      },
      {
        to: "/blog",
        label: "Community Blog",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M2 2.5A.5.5 0 012.5 2h11a.5.5 0 010 1h-11A.5.5 0 012 2.5zM2 5.5A.5.5 0 012.5 5h11a.5.5 0 010 1h-11A.5.5 0 012 5.5zM2.5 8a.5.5 0 000 1h7a.5.5 0 000-1h-7z"
              fill="currentColor"
            />
          </svg>
        ),
      },
    ],
  },
  {
    section: "Account",
    links: [
      {
        to: "/profile",
        label: "My Profile",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle
              cx="8"
              cy="5.5"
              r="2.5"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <path
              d="M2.5 13.5c0-2.485 2.462-4.5 5.5-4.5s5.5 2.015 5.5 4.5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        ),
      },
    ],
  },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const close = () => setIsOpen(false);
  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Hamburger — mobile only */}
      <button
        className="sb-hamburger"
        onClick={() => setIsOpen(true)}
        aria-label="Open navigation"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M3 5h14M3 10h14M3 15h14"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Overlay — mobile */}
      {isOpen && (
        <div className="sb-overlay" onClick={close} aria-hidden="true" />
      )}

      {/* Sidebar */}
      <aside className={`sb-root ${isOpen ? "sb-open" : ""}`}>
        {/* Close button — mobile */}
        <button
          className="sb-close"
          onClick={close}
          aria-label="Close navigation"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M14 4L4 14M4 4l10 10"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Brand */}
        <Link to="/dashboard" className="sb-brand" onClick={close}>
          CS<span>Pathfinder</span>
        </Link>

        {/* User pill */}
        {profile && (
          <div className="sb-user">
            <div className="sb-user-avatar">
              {profile.username?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="sb-user-info">
              <span className="sb-user-name">@{profile.username}</span>
              <span className="sb-user-role">
                {profile.role === "admin" ? "Admin" : "Student"}
              </span>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="sb-nav">
          {NAV.map((group) => (
            <div key={group.section} className="sb-group">
              <p className="sb-section-label">{group.section}</p>
              {group.links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={close}
                  className={`sb-link ${isActive(link.to) ? "sb-link-active" : ""}`}
                >
                  <span className="sb-link-icon" aria-hidden="true">
                    {link.icon}
                  </span>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}

          {/* Admin link — conditional */}
          {profile?.role === "admin" && (
            <div className="sb-group">
              <p className="sb-section-label">Admin</p>
              <Link
                to="/admin"
                onClick={close}
                className={`sb-link sb-link-admin ${isActive("/admin") ? "sb-link-active" : ""}`}
              >
                <span className="sb-link-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M8 1.5a.75.75 0 01.75.75v.878a4.75 4.75 0 012.652 1.531l.76-.439a.75.75 0 01.75 1.299l-.76.438a4.75 4.75 0 010 3.086l.76.439a.75.75 0 01-.75 1.298l-.76-.438a4.75 4.75 0 01-2.652 1.53v.879a.75.75 0 01-1.5 0v-.878a4.75 4.75 0 01-2.652-1.531l-.76.439a.75.75 0 01-.75-1.299l.76-.438a4.75 4.75 0 010-3.086l-.76-.439a.75.75 0 01.75-1.298l.76.438A4.75 4.75 0 017.25 3.128V2.25A.75.75 0 018 1.5zm0 4.25a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                Admin Panel
              </Link>
            </div>
          )}
        </nav>

        {/* Logout */}
        <button className="sb-logout" onClick={handleLogout}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6 2H3.5A1.5 1.5 0 002 3.5v9A1.5 1.5 0 003.5 14H6M10.5 11l3-3-3-3M13.5 8H6"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Log out
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
