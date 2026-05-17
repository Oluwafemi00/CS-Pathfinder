// routes/blogRoutes.js
import express from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// All blog routes require authentication
router.use(requireAuth);

// ── STATIC / NAMED ROUTES FIRST ───────────────────────────────────────────────
// These must be registered before /:id to avoid Express matching "pending",
// "me", etc. as an :id param.

// GET /api/blog/pending — fetch pending posts (admin only)
router.get("/pending", requireAdmin, async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from("blog_posts")
      .select(
        `
        id, title, content, created_at, status,
        profiles!blog_posts_author_id_fkey ( username )
      `,
      )
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching pending posts:", error.message);
    res.status(500).json({ error: "Server error fetching pending posts." });
  }
});

// GET /api/blog/me/posts — logged-in user's own posts (all statuses)
router.get("/me/posts", async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from("blog_posts")
      .select("id, title, content, status, created_at")
      .eq("author_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching my posts:", error.message);
    res.status(500).json({ error: "Server error fetching your posts." });
  }
});

// GET /api/blog/me/votes — posts the logged-in user has voted on
router.get("/me/votes", async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from("blog_votes")
      .select(
        `
        vote_value,
        blog_posts (
          id, title,
          profiles!blog_posts_author_id_fkey ( username )
        )
      `,
      )
      .eq("user_id", req.user.id);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching votes:", error.message);
    res.status(500).json({ error: "Server error fetching votes." });
  }
});

// ── COLLECTION ROUTES ─────────────────────────────────────────────────────────

// GET /api/blog — all published posts with vote scores + current user's vote
router.get("/", async (req, res) => {
  try {
    const { data: posts, error } = await req.supabase
      .from("blog_posts")
      .select(
        `
        id, title, content, created_at,
        profiles!blog_posts_author_id_fkey ( username ),
        blog_votes ( user_id, vote_value )
      `,
      )
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const formatted = posts.map((post) => {
      const score =
        post.blog_votes?.reduce((sum, v) => sum + v.vote_value, 0) ?? 0;
      // Find this user's own vote on this post (-1, 0, or 1)
      const userVote =
        post.blog_votes?.find((v) => v.user_id === req.user.id)?.vote_value ??
        0;
      return { ...post, score, userVote };
    });

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching published posts:", error.message);
    res.status(500).json({ error: "Server error fetching posts." });
  }
});

// POST /api/blog — submit a new post
router.post("/", async (req, res) => {
  const { title, content } = req.body;

  if (!title?.trim() || !content?.trim()) {
    return res.status(400).json({ error: "Title and content are required." });
  }

  try {
    // Check role to decide publish status
    const { data: profile } = await req.supabase
      .from("profiles")
      .select("role")
      .eq("id", req.user.id)
      .single();

    const status = profile?.role === "admin" ? "published" : "pending";

    const { error } = await req.supabase
      .from("blog_posts")
      .insert([
        {
          author_id: req.user.id,
          title: title.trim(),
          content: content.trim(),
          status,
        },
      ]);

    if (error) throw error;
    res
      .status(201)
      .json({ message: `Post submitted. Status: ${status}`, status });
  } catch (error) {
    console.error("Error creating post:", error.message);
    res.status(500).json({ error: "Server error creating post." });
  }
});

// ── PARAMETERISED ROUTES LAST ─────────────────────────────────────────────────

// POST /api/blog/:id/vote — cast or update a vote
router.post("/:id/vote", async (req, res) => {
  const { vote_value } = req.body;
  const post_id = req.params.id;

  if (vote_value !== 1 && vote_value !== -1) {
    return res.status(400).json({ error: "vote_value must be 1 or -1." });
  }

  try {
    const { error } = await req.supabase
      .from("blog_votes")
      .upsert(
        { post_id, user_id: req.user.id, vote_value },
        { onConflict: "post_id,user_id" },
      );

    if (error) throw error;
    res.status(200).json({ message: "Vote recorded." });
  } catch (error) {
    console.error("Error recording vote:", error.message);
    res.status(500).json({ error: "Server error recording vote." });
  }
});

// DELETE /api/blog/:id/vote — remove the user's vote (toggle off)
router.delete("/:id/vote", async (req, res) => {
  const post_id = req.params.id;

  try {
    const { error } = await req.supabase
      .from("blog_votes")
      .delete()
      .match({ post_id, user_id: req.user.id });

    if (error) throw error;
    res.status(200).json({ message: "Vote removed." });
  } catch (error) {
    console.error("Error removing vote:", error.message);
    res.status(500).json({ error: "Server error removing vote." });
  }
});

// PATCH /api/blog/:id/status — approve or reject (admin only)
router.patch("/:id/status", requireAdmin, async (req, res) => {
  const { status } = req.body;

  if (!["published", "rejected"].includes(status)) {
    return res
      .status(400)
      .json({ error: "Status must be 'published' or 'rejected'." });
  }

  try {
    const { data: post, error: fetchError } = await req.supabase
      .from("blog_posts")
      .select("author_id, title")
      .eq("id", req.params.id)
      .single();

    if (fetchError) throw fetchError;

    const { error } = await req.supabase
      .from("blog_posts")
      .update({ status })
      .eq("id", req.params.id);

    if (error) throw error;

    const notifType =
      status === "published" ? "post_approved" : "post_rejected";
    const notifMsg =
      status === "published"
        ? 'Your article "' + post.title + '" has been approved and published!'
        : 'Your article "' + post.title + '" was not approved this time.';

    await req.supabase.from("notifications").insert([
      {
        user_id: post.author_id,
        type: notifType,
        message: notifMsg,
        link: "/blog",
      },
    ]);

    res.status(200).json({ message: "Post marked as " + status + "." });
  } catch (error) {
    console.error("Error updating post status:", error.message);
    res.status(500).json({ error: "Server error updating post status." });
  }
});

export default router;
