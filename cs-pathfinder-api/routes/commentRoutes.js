// routes/commentRoutes.js
import express from "express";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

// GET /api/comments/:postId — fetch all comments for a post
router.get("/:postId", async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from("blog_comments")
      .select(
        `
        id,
        content,
        created_at,
        author_id,
        profiles ( username )
      `,
      )
      .eq("post_id", req.params.postId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching comments:", err.message);
    res.status(500).json({ error: "Server error fetching comments." });
  }
});

// POST /api/comments/:postId — add a comment
router.post("/:postId", async (req, res) => {
  const { content } = req.body;
  const post_id = parseInt(req.params.postId, 10);

  if (!content?.trim()) {
    return res.status(400).json({ error: "Comment content is required." });
  }

  try {
    // Insert the comment
    const { data: comment, error } = await req.supabase
      .from("blog_comments")
      .insert([{ post_id, author_id: req.user.id, content: content.trim() }])
      .select(
        `
        id,
        content,
        created_at,
        author_id,
        profiles ( username )
      `,
      )
      .single();

    if (error) throw error;

    // ── Trigger a notification to the post author ──────────────────────
    // Find who wrote the post
    const { data: post } = await req.supabase
      .from("blog_posts")
      .select("author_id, title")
      .eq("id", post_id)
      .single();

    // Only notify if the commenter is not the post author
    if (post && post.author_id !== req.user.id) {
      await req.supabase.from("notifications").insert([
        {
          user_id: post.author_id,
          type: "new_comment",
          message: `@${comment.profiles.username} commented on your post "${post.title}"`,
          link: "/blog",
        },
      ]);
    }

    res.status(201).json(comment);
  } catch (err) {
    console.error("Error adding comment:", err.message);
    res.status(500).json({ error: "Server error adding comment." });
  }
});

// DELETE /api/comments/:commentId — delete own comment
router.delete("/:commentId", async (req, res) => {
  try {
    const { error } = await req.supabase
      .from("blog_comments")
      .delete()
      .match({ id: req.params.commentId, author_id: req.user.id });

    if (error) throw error;
    res.status(200).json({ message: "Comment deleted." });
  } catch (err) {
    console.error("Error deleting comment:", err.message);
    res.status(500).json({ error: "Server error deleting comment." });
  }
});

export default router;
