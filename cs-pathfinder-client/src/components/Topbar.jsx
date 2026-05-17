// src/components/Topbar.jsx
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../hooks/useProfile";
import NotificationBell from "./NotificationBell";
import "./Topbar.css";

const Topbar = ({ title, subtitle }) => {
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);

  return (
    <div className="tb-root">
      <div className="tb-left">
        {title && (
          <div>
            <h1 className="tb-title">{title}</h1>
            {subtitle && <p className="tb-subtitle">{subtitle}</p>}
          </div>
        )}
      </div>

      <div className="tb-right">
        <NotificationBell />

        <div className="tb-user">
          <div className="tb-avatar" aria-hidden="true">
            {(profile?.username?.[0] ?? "U").toUpperCase()}
          </div>
          <span className="tb-username">@{profile?.username ?? "..."}</span>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
