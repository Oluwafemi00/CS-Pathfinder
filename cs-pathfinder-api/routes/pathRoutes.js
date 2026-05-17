// routes/pathRoutes.js
import express from "express";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// All path routes require authentication
router.use(requireAuth);

// ── STATIC / NAMED ROUTES FIRST ───────────────────────────────────────────────
// Must come before /:id to avoid Express swallowing "me" as a param

// GET /api/paths/me/enrolled — all paths the user is enrolled in
router.get("/me/enrolled", async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from("user_enrollments")
      .select(
        `
        enrolled_at,
        paths ( id, title, description, difficulty )
      `,
      )
      .eq("user_id", req.user.id)
      .order("enrolled_at", { ascending: false });

    if (error) throw error;

    const enrolledPaths = data.map((record) => record.paths);
    res.status(200).json(enrolledPaths);
  } catch (error) {
    console.error("Error fetching enrollments:", error.message);
    res.status(500).json({ error: "Server error fetching enrollments." });
  }
});

// ── COLLECTION ROUTES ─────────────────────────────────────────────────────────

// GET /api/paths — all paths with resource counts
router.get("/", async (req, res) => {
  try {
    const { data: paths, error } = await req.supabase
      .from("paths")
      .select("id, title, description, difficulty, resources(count)")
      .order("created_at", { ascending: true });

    if (error) throw error;

    const formatted = paths.map((path) => ({
      id: path.id,
      title: path.title,
      description: path.description,
      difficulty: path.difficulty,
      resourceCount: path.resources[0]?.count ?? 0,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching paths:", error.message);
    res.status(500).json({ error: "Server error fetching paths." });
  }
});

// ── PARAMETERISED ROUTES LAST ─────────────────────────────────────────────────

// GET /api/paths/:id — single path metadata
router.get("/:id", async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from("paths")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching path:", error.message);
    res.status(500).json({ error: "Server error fetching path details." });
  }
});

// GET /api/paths/:id/resources — all resources for a path in order
router.get("/:id/resources", async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from("resources")
      .select("*")
      .eq("path_id", req.params.id)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching resources:", error.message);
    res.status(500).json({ error: "Server error fetching resources." });
  }
});

// POST /api/paths/:id/enroll — enrol the user in a path
router.post("/:id/enroll", async (req, res) => {
  const pathId = req.params.id;

  try {
    const { error } = await req.supabase
      .from("user_enrollments")
      .insert([{ user_id: req.user.id, path_id: pathId }]);

    // 23505 = unique violation — user is already enrolled, treat as success
    if (error && error.code !== "23505") throw error;

    res.status(201).json({ message: "Successfully enrolled in path!" });
  } catch (error) {
    console.error("Error enrolling in path:", error.message);
    res.status(500).json({ error: "Server error during enrollment." });
  }
});

export default router;
