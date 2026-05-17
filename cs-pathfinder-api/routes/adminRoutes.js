// routes/adminRoutes.js
import express from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// ✅ Every admin route is protected at the Express level — not just by RLS
router.use(requireAuth, requireAdmin);

// POST /api/admin/paths — create a new learning path
router.post("/paths", async (req, res) => {
  const { title, description, difficulty, about } = req.body;

  if (!title?.trim() || !description?.trim() || !difficulty || !about?.trim()) {
    return res.status(400).json({ error: "All fields are required." });
  }

  if (!["Beginner", "Intermediate", "Advanced"].includes(difficulty)) {
    return res.status(400).json({ error: "Invalid difficulty value." });
  }

  try {
    const { data, error } = await req.supabase
      .from("paths")
      .insert([
        {
          title: title.trim(),
          description: description.trim(),
          difficulty,
          about: about.trim(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ message: "Path created successfully!", path: data });
  } catch (error) {
    console.error("Error creating path:", error.message);
    res.status(500).json({ error: "Server error creating path." });
  }
});

// POST /api/admin/resources — add a resource to a path
router.post("/resources", async (req, res) => {
  const { path_id, title, resource_type, url, description } = req.body;

  if (!path_id || !title?.trim() || !resource_type || !url?.trim()) {
    return res
      .status(400)
      .json({ error: "path_id, title, resource_type, and url are required." });
  }

  const VALID_TYPES = ["Interactive Course", "Article", "Project", "Video"];
  if (!VALID_TYPES.includes(resource_type)) {
    return res
      .status(400)
      .json({
        error: `resource_type must be one of: ${VALID_TYPES.join(", ")}.`,
      });
  }

  try {
    const { data, error } = await req.supabase
      .from("resources")
      .insert([
        {
          path_id: parseInt(path_id, 10),
          title: title.trim(),
          resource_type,
          url: url.trim(),
          description: description?.trim() ?? "",
        },
      ])
      .select()
      .single();

    if (error) throw error;
    res
      .status(201)
      .json({ message: "Resource added successfully!", resource: data });
  } catch (error) {
    console.error("Error adding resource:", error.message);
    res.status(500).json({ error: "Server error adding resource." });
  }
});

export default router;
