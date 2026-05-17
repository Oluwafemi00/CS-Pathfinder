// routes/communityRoutes.js
import express from "express";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// All community routes require a valid session
router.use(requireAuth);

// GET /api/community — fetch all posts, oldest first (for chat-style scroll)
router.get("/", async (req, res) => {
  try {
    const { data: posts, error } = await req.supabase
      .from("community_posts")
      .select(
        `
        id,
        content,
        created_at,
        user_id,
        profiles ( username )
      `,
      )
      .order("created_at", { ascending: true }); // ✅ oldest first for chat UI

    if (error) throw error;
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching community posts:", error.message);
    res.status(500).json({ error: "Server error fetching posts." });
  }
});

// POST /api/community — create a new post
router.post("/", async (req, res) => {
  const { content } = req.body;

  if (!content?.trim()) {
    return res.status(400).json({ error: "Content is required." });
  }

  try {
    // ✅ user_id resolved server-side from the verified JWT — not trusted from body
    const { data, error } = await req.supabase
      .from("community_posts")
      .insert([{ user_id: req.user.id, content: content.trim() }])
      .select(
        `
        id,
        content,
        created_at,
        user_id,
        profiles ( username )
      `,
      )
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error("Error creating post:", error.message);
    res.status(500).json({ error: "Server error creating post." });
  }
});

export default router;
