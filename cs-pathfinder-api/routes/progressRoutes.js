// routes/progressRoutes.js
import express from "express";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// All progress routes require a valid session
router.use(requireAuth);

// GET /api/progress — return completed resource IDs as a clean number array
router.get("/", async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from("user_progress")
      .select("resource_id");

    if (error) throw error;

    // ✅ Always returns a flat number array e.g. [1, 3, 7]
    // Frontend can do a simple completedIds.includes(id) check
    const completedIds = data.map((row) => row.resource_id);
    res.status(200).json(completedIds);
  } catch (error) {
    console.error("Error fetching progress:", error.message);
    res.status(500).json({ error: "Server error fetching progress." });
  }
});

// POST /api/progress/toggle — mark a resource complete or incomplete
router.post("/toggle", async (req, res) => {
  const { resource_id, is_completed } = req.body;

  if (!resource_id) {
    return res.status(400).json({ error: "resource_id is required." });
  }

  try {
    if (is_completed) {
      // Upsert so duplicate calls don't throw an error
      const { error } = await req.supabase
        .from("user_progress")
        .upsert([{ user_id: req.user.id, resource_id }], {
          onConflict: "user_id,resource_id",
        });
      if (error) throw error;
    } else {
      const { error } = await req.supabase
        .from("user_progress")
        .delete()
        .match({ user_id: req.user.id, resource_id });
      if (error) throw error;
    }

    res.status(200).json({ success: true, resource_id, is_completed });
  } catch (error) {
    console.error("Error toggling progress:", error.message);
    res.status(500).json({ error: "Server error toggling progress." });
  }
});

// GET /api/progress/streak — compute streak + activity days for the user
router.get("/streak", async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from("user_progress")
      .select("completed_at")
      .order("completed_at", { ascending: false });

    if (error) throw error;

    // Build a set of unique dates the user completed something
    const daySet = new Set(
      data
        .filter((r) => r.completed_at)
        .map((r) => r.completed_at.slice(0, 10)), // "YYYY-MM-DD"
    );

    const activityDays = Array.from(daySet).sort();
    const totalDone = data.length;

    // Compute streak: count consecutive days ending today or yesterday
    let streak = 0;
    let cursor = new Date();
    cursor.setHours(0, 0, 0, 0);

    // Allow streak to count if user already completed something today
    const todayStr = cursor.toISOString().slice(0, 10);
    const yesterdayStr = new Date(cursor - 86400000).toISOString().slice(0, 10);

    // Start from today; if no activity today start from yesterday
    if (!daySet.has(todayStr) && daySet.has(yesterdayStr)) {
      cursor = new Date(cursor - 86400000);
    } else if (!daySet.has(todayStr)) {
      // No activity today or yesterday — streak is 0
      return res.status(200).json({ streak: 0, totalDone, activityDays });
    }

    while (true) {
      const dateStr = cursor.toISOString().slice(0, 10);
      if (!daySet.has(dateStr)) break;
      streak++;
      cursor = new Date(cursor - 86400000);
    }

    res.status(200).json({ streak, totalDone, activityDays });
  } catch (error) {
    console.error("Error computing streak:", error.message);
    res.status(500).json({ error: "Server error computing streak." });
  }
});

// GET /api/progress/history — return completed_at timestamps for streak calculation
router.get("/history", async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from("user_progress")
      .select("resource_id, completed_at")
      .order("completed_at", { ascending: true });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching progress history:", error.message);
    res.status(500).json({ error: "Server error fetching history." });
  }
});

export default router;
