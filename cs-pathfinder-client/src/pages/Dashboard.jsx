// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext"; // Import AuthContext
import { useProfile } from "../hooks/useProfile";
import Sidebar from "../components/Sidebar";
import "./Dashboard.css";

const Dashboard = () => {
  const location = useLocation();

  // 1. Get the current logged-in user
  const { user } = useAuth();

  // 2. Fetch their specific profile metadata
  const { profile, loadingProfile } = useProfile(user?.id);

  // 1. Set up state to hold our real data, loading status, and potential errors
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showWelcomeModal, setShowWelcomeModal] = useState(
    location.state?.isNewUser || false,
  );

  const handleCloseModal = () => {
    setShowWelcomeModal(false);
    // This removes the 'isNewUser' state so the modal doesn't pop up again if they refresh the page
    window.history.replaceState({}, document.title);
  };

  // 2. Use useEffect to fetch data as soon as the Dashboard loads
  useEffect(() => {
    // (Keep your existing Express API fetch logic here)
    const fetchLearningPath = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/paths/1/resources",
        );
        if (!response.ok)
          throw new Error("Failed to fetch learning resources.");
        const data = await response.json();
        setResources(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLearningPath();
  }, []);

  return (
    <div className="dashboard-layout">
      {/* 5. Render the Modal Conditionally! */}
      {showWelcomeModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Welcome to CS Pathfinder! 🚀</h2>
            <p>
              We are thrilled to have you here, {profile?.username || "Student"}
              . Your personalized learning journey starts right now. Let's
              bridge the gap between theory and technical mastery!
            </p>
            <button className="modal-btn" onClick={handleCloseModal}>
              Let's Go
            </button>
          </div>
        </div>
      )}
      <Sidebar />
      {/* Main Content */}
      <main className="main-content">
        <header className="dashboard-header">
          {/* 3. Display the dynamic username! */}
          <h1>
            Welcome back,{" "}
            {loadingProfile ? "Student" : profile?.username || "Student"}
          </h1>
          <p>Here are your curated resources for mastering your chosen path.</p>

          {/* 4. Display their expectations as a motivational reminder */}
          {!loadingProfile && profile?.expectations && (
            <div
              style={{
                marginTop: "1rem",
                padding: "1rem",
                backgroundColor: "#e0f2fe",
                borderRadius: "8px",
                borderLeft: "4px solid var(--primary-blue)",
              }}
            >
              <strong>Your Goal:</strong> "{profile.expectations}"
            </div>
          )}
        </header>

        {isLoading && <p>Loading your curriculum...</p>}
        {error && <p style={{ color: "red" }}>Error: {error}</p>}

        {!isLoading && !error && resources.length > 0 && (
          <section className="resource-grid">
            {resources.map((resource) => (
              <div key={resource.id} className="resource-card">
                <span className="resource-tag">{resource.resource_type}</span>
                <h3>{resource.title}</h3>
                <p>{resource.description}</p>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="resource-action"
                >
                  Start Module
                </a>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
