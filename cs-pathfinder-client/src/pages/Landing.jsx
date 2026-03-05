// src/pages/Landing.jsx
import { Link } from "react-router-dom";
import "./Landing.css";

const Landing = () => {
  const careerPaths = [
    "Frontend Development",
    "Backend Development",
    "Mobile Development",
    "Data Science",
    "Artificial Intelligence",
    "Cybersecurity",
    "Internet of Things",
  ];

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <header className="hero-section flex-col flex-center">
        <h1 className="hero-title">Welcome to CS Pathfinder</h1>
        <p className="hero-subtitle">
          Bridging the gap between theoretical learning and technical mastery.
        </p>
        <div className="auth-buttons">
          <Link to="/login" className="btn-primary">
            Login
          </Link>
          <Link to="/register" className="btn-secondary">
            Register
          </Link>
        </div>
      </header>

      {/* Info Section */}
      <section className="info-section flex-center">
        <div className="info-card">
          <h2>Explore Computer Science Career Paths</h2>
          <p>
            CS Pathfinder is designed to help beginners and early-stage tech
            learners understand where computer science skills can take them.
            Each path below explains what the role is, what you’ll learn, and
            the opportunities it unlocks, even if you’re brand new to tech.
          </p>
        </div>
      </section>

      {/* Dynamic Paths Grid */}
      <section className="paths-preview">
        <div className="grid-cards">
          {careerPaths.map((path) => (
            <Link
              key={path}
              to={`/${path.toLowerCase().replace(/ /g, "-")}`}
              className="path-card flex-center"
            >
              {path}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Landing;
