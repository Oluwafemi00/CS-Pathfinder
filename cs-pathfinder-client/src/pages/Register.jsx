// src/pages/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../config/supabaseClient";
import "./Auth.css";

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One number", test: (p) => /[0-9]/.test(p) },
];

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    reason: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // 2-step form
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!formData.username.trim()) {
      setError("Username is required.");
      return;
    }
    if (!formData.email.trim()) {
      setError("Email is required.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    const { error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          username: formData.username,
          expectations: formData.reason,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    navigate("/dashboard", { state: { isNewUser: true } });
  };

  const passwordStrength = PASSWORD_RULES.filter((r) =>
    r.test(formData.password),
  ).length;

  const strengthLabel = ["", "Weak", "Fair", "Strong"][passwordStrength];
  const strengthClass = ["", "weak", "fair", "strong"][passwordStrength];

  return (
    <div className="auth-root">
      <div className="auth-grid-bg" aria-hidden="true" />
      <div className="auth-glow" aria-hidden="true" />

      <Link to="/" className="auth-back">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M10 12L6 8l4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        CS Pathfinder
      </Link>

      <div className="auth-card auth-card-wide">
        {/* Header */}
        <div className="auth-card-header">
          <div className="auth-logo">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="#3b82f6"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">
            Join the department and start your journey.
          </p>
        </div>

        {/* Step indicator */}
        <div className="auth-steps">
          <div
            className={`auth-step ${step >= 1 ? "active" : ""} ${step > 1 ? "done" : ""}`}
          >
            <div className="auth-step-circle">
              {step > 1 ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6l3 3 5-5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                "1"
              )}
            </div>
            <span>Your info</span>
          </div>
          <div className="auth-step-line" />
          <div className={`auth-step ${step >= 2 ? "active" : ""}`}>
            <div className="auth-step-circle">2</div>
            <span>Security</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="auth-error" role="alert">
            <svg
              width="15"
              height="15"
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
        )}

        {/* Step 1 — Your info */}
        {step === 1 && (
          <form className="auth-form" onSubmit={handleNext} noValidate>
            <div className="auth-field">
              <label className="auth-label" htmlFor="username">
                Username
              </label>
              <div className="auth-input-wrap">
                <svg
                  className="auth-input-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="8"
                    cy="5"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M2 14c0-3 2.5-5 6-5s6 2 6 5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="auth-input"
                  placeholder="e.g. john_doe"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="email">
                Email address
              </label>
              <div className="auth-input-wrap">
                <svg
                  className="auth-input-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <rect
                    x="1"
                    y="3"
                    width="14"
                    height="10"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M1 6l7 4 7-4"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                </svg>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="auth-input"
                  placeholder="you@university.edu"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="reason">
                What are your goals?
                <span className="auth-label-optional">optional</span>
              </label>
              <textarea
                id="reason"
                name="reason"
                className="auth-textarea"
                placeholder="Tell us what you hope to achieve with CS Pathfinder…"
                value={formData.reason}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <button type="submit" className="auth-submit">
              Continue
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
          </form>
        )}

        {/* Step 2 — Security */}
        {step === 2 && (
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-label" htmlFor="password">
                Password
              </label>
              <div className="auth-input-wrap">
                <svg
                  className="auth-input-icon"
                  width="16"
                  height="16"
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
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className="auth-input auth-input-password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="auth-eye"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M2 8s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z"
                        stroke="currentColor"
                        strokeWidth="1.4"
                      />
                      <circle
                        cx="8"
                        cy="8"
                        r="1.5"
                        stroke="currentColor"
                        strokeWidth="1.4"
                      />
                      <path
                        d="M3 3l10 10"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M2 8s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z"
                        stroke="currentColor"
                        strokeWidth="1.4"
                      />
                      <circle
                        cx="8"
                        cy="8"
                        r="1.5"
                        stroke="currentColor"
                        strokeWidth="1.4"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {/* Strength meter */}
              {formData.password && (
                <div className="auth-strength">
                  <div className="auth-strength-bars">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`auth-strength-bar ${i <= passwordStrength ? strengthClass : ""}`}
                      />
                    ))}
                  </div>
                  <span className={`auth-strength-label ${strengthClass}`}>
                    {strengthLabel}
                  </span>
                </div>
              )}

              {/* Rules checklist */}
              {formData.password && (
                <ul className="auth-rules">
                  {PASSWORD_RULES.map((rule, i) => (
                    <li
                      key={i}
                      className={`auth-rule ${rule.test(formData.password) ? "pass" : ""}`}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        aria-hidden="true"
                      >
                        {rule.test(formData.password) ? (
                          <path
                            d="M2 6l3 3 5-5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        ) : (
                          <circle
                            cx="6"
                            cy="6"
                            r="5"
                            stroke="currentColor"
                            strokeWidth="1.2"
                          />
                        )}
                      </svg>
                      {rule.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="confirmPassword">
                Confirm password
              </label>
              <div className="auth-input-wrap">
                <svg
                  className="auth-input-icon"
                  width="16"
                  height="16"
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
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className={`auth-input ${
                    formData.confirmPassword &&
                    formData.password !== formData.confirmPassword
                      ? "auth-input-error"
                      : ""
                  }`}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
              </div>
              {formData.confirmPassword &&
                formData.password !== formData.confirmPassword && (
                  <p className="auth-field-error">Passwords don't match</p>
                )}
            </div>

            <div className="auth-step2-actions">
              <button
                type="button"
                className="auth-back-btn"
                onClick={() => {
                  setStep(1);
                  setError(null);
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M10 12L6 8l4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Back
              </button>
              <button
                type="submit"
                className={`auth-submit auth-submit-flex ${loading ? "auth-submit-loading" : ""}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="auth-spinner" aria-hidden="true" />
                    Creating account…
                  </>
                ) : (
                  <>
                    Create account
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
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login" className="auth-switch-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
