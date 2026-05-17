// routes/notificationRoutes.js
import express from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

// GET /api/notifications — fetch all notifications for the logged-in user
router.get("/", async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from("notifications")
      .select("id, type, message, link, is_read, created_at")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false })
      .limit(30); // cap at 30 — enough for any UI

    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching notifications:", err.message);
    res.status(500).json({ error: "Server error fetching notifications." });
  }
});

// PATCH /api/notifications/:id/read — mark a single notification as read
router.patch("/:id/read", async (req, res) => {
  try {
    const { error } = await req.supabase
      .from("notifications")
      .update({ is_read: true })
      .match({ id: req.params.id, user_id: req.user.id });

    if (error) throw error;
    res.status(200).json({ message: "Notification marked as read." });
  } catch (err) {
    console.error("Error marking notification read:", err.message);
    res.status(500).json({ error: "Server error." });
  }
});

// PATCH /api/notifications/read-all — mark all as read
router.patch("/read-all", async (req, res) => {
  try {
    const { error } = await req.supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", req.user.id)
      .eq("is_read", false);

    if (error) throw error;
    res.status(200).json({ message: "All notifications marked as read." });
  } catch (err) {
    console.error("Error marking all read:", err.message);
    res.status(500).json({ error: "Server error." });
  }
});

// ── Admin helpers — fire notifications on blog post status changes ────────────
// Called internally from blogRoutes when a post is approved/rejected.
// Also exposed as a standalone route for flexibility.

// POST /api/notifications/send — internal: send a notification to a user
// (Admin only — used by blogRoutes patch status handler)
router.post("/send", requireAdmin, async (req, res) => {
  const { user_id, type, message, link } = req.body;

  if (!user_id || !type || !message) {
    return res
      .status(400)
      .json({ error: "user_id, type, and message are required." });
  }

  try {
    const { error } = await req.supabase
      .from("notifications")
      .insert([{ user_id, type, message, link }]);

    if (error) throw error;
    res.status(201).json({ message: "Notification sent." });
  } catch (err) {
    console.error("Error sending notification:", err.message);
    res.status(500).json({ error: "Server error sending notification." });
  }
});

export default router;
