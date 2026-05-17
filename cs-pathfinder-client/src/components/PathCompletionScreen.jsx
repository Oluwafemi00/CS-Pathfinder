// src/components/PathCompletionScreen.jsx
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./PathCompletionScreen.css";

// Tiny canvas confetti
const launchConfetti = (canvas) => {
  const ctx = canvas.getContext("2d");
  const pieces = Array.from({ length: 80 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    r: Math.random() * 6 + 3,
    d: Math.random() * 80 + 20,
    color: ["#3b82f6", "#34d399", "#fcd34d", "#f472b6", "#a78bfa"][
      Math.floor(Math.random() * 5)
    ],
    tilt: Math.random() * 10 - 5,
    tiltAngle: 0,
    tiltSpeed: Math.random() * 0.07 + 0.05,
  }));

  let angle = 0;
  let frame;

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    angle += 0.01;
    pieces.forEach((p) => {
      p.tiltAngle += p.tiltSpeed;
      p.y += (Math.cos(angle + p.d) + 2) * 1.2;
      p.x += Math.sin(angle) * 1.5;
      p.tilt = Math.sin(p.tiltAngle) * 12;

      ctx.beginPath();
      ctx.lineWidth = p.r;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 3, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 5);
      ctx.stroke();

      if (p.y > canvas.height) {
        p.y = -10;
        p.x = Math.random() * canvas.width;
      }
    });
    frame = requestAnimationFrame(draw);
  };

  draw();
  // Stop after 4s
  setTimeout(() => cancelAnimationFrame(frame), 4000);
};

const PathCompletionScreen = ({ pathTitle, username, onDismiss }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      launchConfetti(canvas);
    }
  }, []);

  return (
    <div
      className="pc-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pc-title"
    >
      <canvas ref={canvasRef} className="pc-canvas" aria-hidden="true" />

      <div className="pc-card">
        {/* Badge */}
        <div className="pc-badge" aria-hidden="true">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <circle
              cx="18"
              cy="18"
              r="17"
              stroke="#fcd34d"
              strokeWidth="1.5"
              fill="rgba(245,158,11,0.1)"
            />
            <path
              d="M18 8l2.5 7h7.5l-6 4.5 2.5 7L18 22l-6.5 4.5 2.5-7L8 15h7.5L18 8z"
              fill="#fcd34d"
              stroke="#fcd34d"
              strokeWidth="0.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2 id="pc-title" className="pc-title">
          Path Complete!
        </h2>
        <p className="pc-congrats">
          Incredible work, <strong>{username}</strong>. You've finished every
          resource in <strong>{pathTitle}</strong>.
        </p>

        {/* Stats */}
        <div className="pc-stats">
          <div className="pc-stat">
            <span className="pc-stat-value">100%</span>
            <span className="pc-stat-label">Completed</span>
          </div>
          <div className="pc-stat-divider" aria-hidden="true" />
          <div className="pc-stat">
            <span className="pc-stat-value">🏆</span>
            <span className="pc-stat-label">Badge earned</span>
          </div>
          <div className="pc-stat-divider" aria-hidden="true" />
          <div className="pc-stat">
            <span className="pc-stat-value">✓</span>
            <span className="pc-stat-label">All done</span>
          </div>
        </div>

        {/* Actions */}
        <div className="pc-actions">
          <Link to="/explore" className="pc-btn-primary">
            Explore more paths
            <svg
              width="15"
              height="15"
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
          <button className="pc-btn-secondary" onClick={onDismiss}>
            Stay on this path
          </button>
        </div>
      </div>
    </div>
  );
};

export default PathCompletionScreen;
