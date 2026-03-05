// src/components/Sidebar.jsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../config/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../hooks/useProfile";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Gets the current URL path

  const { user } = useAuth();
  const { profile, loadingProfile } = useProfile(user?.id);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: "http://localhost:5173/update-password",
      });
      if (error) throw error;
      alert("A password reset link has been sent to your email!");
    } catch (error) {
      console.error("Error sending reset email:", error.message);
      alert("Failed to send reset email. Please try again.");
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">CS Pathfinder</div>

      <nav className="sidebar-nav">
        <Link
          to="/dashboard"
          className={`sidebar-link ${location.pathname === "/dashboard" ? "active" : ""}`}
        >
          My Learning Path
        </Link>
        <Link
          to="/explore"
          className={`sidebar-link ${location.pathname === "/explore" ? "active" : ""}`}
        >
          Explore All Paths
        </Link>
        <Link
          to="/community"
          className={`sidebar-link ${location.pathname === "/community" ? "active" : ""}`}
        >
          Community chat
        </Link>
      </nav>

      {/* User Profile Section */}
      <div className="sidebar-profile">
        <div className="profile-username">
          @{loadingProfile ? "..." : profile?.username || "Student"}
        </div>
        <div className="profile-email">{user?.email}</div>

        {!loadingProfile && profile?.expectations && (
          <div className="profile-goal">"{profile.expectations}"</div>
        )}

        <button onClick={handleResetPassword} className="reset-password-btn">
          Reset Password
        </button>
      </div>

      <button onClick={handleLogout} className="logout-btn">
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
