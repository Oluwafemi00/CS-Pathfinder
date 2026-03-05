// routes/pathRoutes.js
import express from "express";
import { supabase } from "../config/supabase.js";

const router = express.Router();

// GET /api/paths - Fetch all learning paths
router.get("/", async (req, res) => {
  try {
    const { data: paths, error } = await supabase
      .from("paths")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;

    res.status(200).json(paths);
  } catch (error) {
    console.error("Error fetching paths:", error.message);
    res.status(500).json({ error: "Server error fetching paths" });
  }
});

// GET /api/paths/:id/resources - Fetch curated resources for a specific path
router.get("/:id/resources", async (req, res) => {
  const pathId = req.params.id;

  try {
    const { data: resources, error } = await supabase
      .from("resources")
      .select("*")
      .eq("path_id", pathId)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    res.status(200).json(resources);
  } catch (error) {
    console.error("Error fetching resources:", error.message);
    res.status(500).json({ error: "Server error fetching resources" });
  }
});

export default router;
