// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pathRoutes from "./routes/pathRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── CORS ──────────────────────────────────────────────────────────────────────
// Locked to your frontend origin. Add staging/prod URLs as needed.
const ALLOWED_ORIGINS = [
  "http://localhost:5173", // Vite dev
  "http://localhost:3000", // CRA fallback
  process.env.FRONTEND_URL, // Production — set in .env
].filter(Boolean); // removes undefined if FRONTEND_URL isn't set

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server requests (no origin) and whitelisted origins
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// ── BODY PARSING ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── ROUTES ────────────────────────────────────────────────────────────────────
app.use("/api/paths", pathRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);

// ── HEALTH CHECK ──────────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({
    message: "CS Pathfinder API is running.",
    timestamp: new Date().toISOString(),
  });
});

// ── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Internal server error." });
});

// ── START ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`   Allowed origins: ${ALLOWED_ORIGINS.join(", ")}`);
});
