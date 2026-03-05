import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

// Helper function to create a Supabase client that acts as the logged-in user
const getAuthClient = (req) => {
  // Extract the token React sent us in the headers
  const token = req.headers.authorization?.split(" ")[1];

  // Create a temporary client with that specific user's token
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    global: {
      headers: { Authorization: `Bearer ${token}` },
    },
  });
};

// GET /api/community
router.get("/", async (req, res) => {
  try {
    const supabaseAuthClient = getAuthClient(req); // Use the authenticated client!

    const { data: posts, error } = await supabaseAuthClient
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
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching community posts:", error.message);
    res.status(500).json({ error: "Server error fetching posts" });
  }
});

// POST /api/community
router.post("/", async (req, res) => {
  const { user_id, content } = req.body;

  if (!user_id || !content) {
    return res.status(400).json({ error: "User ID and content are required." });
  }

  try {
    const supabaseAuthClient = getAuthClient(req); // Use the authenticated client!

    const { data, error } = await supabaseAuthClient
      .from("community_posts")
      .insert([{ user_id, content }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    console.error("Error creating post:", error.message);
    res.status(500).json({ error: "Server error creating post" });
  }
});

export default router;
