// src/pages/Landing.jsx
import { Link } from "react-router-dom";
import "./Landing.css";

const features = [
  {
    icon: "🗺",
    title: "Curated Learning Paths",
    description:
      "Follow structured tracks built by the department — from beginner fundamentals to advanced system design.",
  },
  {
    icon: "📈",
    title: "Progress Tracking",
    description:
      "Mark modules complete, watch your progress bar climb, and stay accountable to your own goals.",
  },
  {
    icon: "✍️",
    title: "Community Blog",
    description:
      "Write articles, share discoveries, and vote on the best content from your peers.",
  },
  {
    icon: "💬",
    title: "Department Chat",
    description:
      "A real-time space to ask questions, share resources, and collaborate with classmates.",
  },
  {
    icon: "🏆",
    title: "Peer Leaderboard",
    description:
      "See how you stack up. Healthy competition keeps the whole cohort moving forward.",
  },
  {
    icon: "⚙️",
    title: "Admin Controls",
    description:
      "Lecturers can publish paths, moderate content, and track cohort-wide progress.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create your account",
    body: "Sign up with your department email in under a minute.",
  },
  {
    number: "02",
    title: "Pick a learning path",
    body: "Browse beginner to advanced tracks and enrol with one click.",
  },
  {
    number: "03",
    title: "Track & ship",
    body: "Work through curated resources, mark them done, and level up.",
  },
];

const Landing = () => {
  return (
    <div className="lp-root">
      {/* ── NAV ── */}
      <nav className="lp-nav">
        <Link to="/" className="lp-brand">
          CS<span>Pathfinder</span>
        </Link>
        <div className="lp-nav-links">
          <a href="#features" className="lp-nav-link">
            Features
          </a>
          <a href="#how" className="lp-nav-link">
            How it works
          </a>
        </div>
        <div className="lp-nav-actions">
          <Link to="/login" className="lp-btn-ghost">
            Log in
          </Link>
          <Link to="/register" className="lp-btn-solid">
            Get started
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="lp-hero">
        <div className="lp-hero-grid-bg" aria-hidden="true" />
        <div className="lp-hero-glow" aria-hidden="true" />

        <div className="lp-hero-inner">
          <div className="lp-eyebrow">
            <span className="lp-dot" />
            Built for CS students, by the department
          </div>

          <h1 className="lp-hero-title">
            Bridge the gap between
            <br />
            theory and <em>mastery</em>.
          </h1>

          <p className="lp-hero-sub">
            Track your progress through structured curricula, collaborate with
            peers in real time, and build the skills that actually get you
            hired.
          </p>

          <div className="lp-hero-ctas">
            <Link to="/register" className="lp-cta-primary">
              Start your journey
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
            <Link to="/login" className="lp-cta-secondary">
              I already have an account
            </Link>
          </div>

          <div className="lp-hero-social-proof">
            <div className="lp-avatars">
              {["A", "B", "C", "D"].map((l, i) => (
                <div key={i} className="lp-avatar" style={{ zIndex: 4 - i }}>
                  {l}
                </div>
              ))}
            </div>
            <p>
              Joined by <strong>200+</strong> students this semester
            </p>
          </div>
        </div>

        {/* Floating dashboard preview card */}
        <div className="lp-hero-card" aria-hidden="true">
          <div className="lp-card-header">
            <div className="lp-card-dots">
              <span />
              <span />
              <span />
            </div>
            <span className="lp-card-title">Full-Stack Web Development</span>
          </div>
          <div className="lp-card-progress-row">
            <span>Course progress</span>
            <span className="lp-card-pct">62%</span>
          </div>
          <div className="lp-card-track">
            <div className="lp-card-fill" style={{ width: "62%" }} />
          </div>
          <div className="lp-card-modules">
            {[
              {
                tag: "Video",
                title: "React 19 — Concurrent rendering",
                done: true,
              },
              {
                tag: "Article",
                title: "Supabase RLS policies explained",
                done: false,
              },
              {
                tag: "Project",
                title: "Build a REST API with Express",
                done: false,
              },
            ].map((m, i) => (
              <div key={i} className="lp-module-row">
                <span className={`lp-module-tag lp-tag-${m.tag.toLowerCase()}`}>
                  {m.tag}
                </span>
                <span className="lp-module-title">{m.title}</span>
                <span className={`lp-module-check ${m.done ? "done" : ""}`}>
                  {m.done ? "✓" : "○"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="lp-features" id="features">
        <div className="lp-section-inner">
          <div className="lp-section-header">
            <p className="lp-section-label">Everything you need</p>
            <h2 className="lp-section-title">
              One platform. Your entire CS journey.
            </h2>
            <p className="lp-section-sub">
              From day one to final year project — CS Pathfinder has the tools
              to keep you on track.
            </p>
          </div>

          <div className="lp-features-grid">
            {features.map((f, i) => (
              <div key={i} className="lp-feature-card">
                <div className="lp-feature-icon">{f.icon}</div>
                <h3 className="lp-feature-title">{f.title}</h3>
                <p className="lp-feature-body">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="lp-how" id="how">
        <div className="lp-section-inner">
          <div className="lp-section-header">
            <p className="lp-section-label">Simple by design</p>
            <h2 className="lp-section-title">Up and running in minutes.</h2>
          </div>

          <div className="lp-steps">
            {steps.map((s, i) => (
              <div key={i} className="lp-step">
                <div className="lp-step-number">{s.number}</div>
                <div className="lp-step-content">
                  <h3 className="lp-step-title">{s.title}</h3>
                  <p className="lp-step-body">{s.body}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="lp-step-connector" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="lp-cta-banner">
        <div className="lp-banner-glow" aria-hidden="true" />
        <h2 className="lp-banner-title">Ready to level up?</h2>
        <p className="lp-banner-sub">
          Join your cohort and start learning with purpose today.
        </p>
        <Link to="/register" className="lp-cta-primary lp-banner-cta">
          Create your free account
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
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <span className="lp-brand lp-footer-brand">
            CS<span>Pathfinder</span>
          </span>
          <p className="lp-footer-copy">
            © {new Date().getFullYear()} CS Pathfinder. Built for the
            department.
          </p>
          <div className="lp-footer-links">
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
