// src/pages/Community.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../config/supabaseClient";
import Sidebar from "../components/Sidebar";
import "./Dashboard.css"; // Reuse the layout styles
import "./Community.css"; // Add our specific community styles

const Community = () => {
  const { user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch posts when the page loads
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      // 1. Grab the secure session token
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // If there's no session, we shouldn't try to fetch
      if (!session?.access_token) {
        console.error("No valid session found.");
        setIsLoading(false);
        return;
      }

      const response = await fetch("http://localhost:5000/api/community", {
        headers: {
          Authorization: `Bearer ${session?.access_token}`, // Send the token!
        },
      });
      if (!response.ok) throw new Error("Failed to fetch posts");
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // The fixed useEffect hook!
  useEffect(() => {
    // Because this page is wrapped in <ProtectedRoute>, we know the user is logged in.
    // We can confidently fetch the posts the exact millisecond the component mounts.
    fetchPosts();
  }, []); // The empty array [] guarantees this runs exactly once when the page loads.

  // Handle submitting a new post
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    try {
      // 1. Grab the secure session token
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch("http://localhost:5000/api/community", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`, // Send the token!
        },
        body: JSON.stringify({
          user_id: user.id,
          content: newPostContent,
        }),
      });

      if (!response.ok) throw new Error("Failed to create post");

      setNewPostContent("");
      fetchPosts();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="main-content">
        <header className="dashboard-header">
          <h1>Department Community</h1>
          <p>
            Share resources, ask questions, and collaborate with your peers.
          </p>
        </header>

        {/* Input Form for New Posts */}
        <form className="new-post-form" onSubmit={handlePostSubmit}>
          <textarea
            className="new-post-input"
            placeholder="What are you working on today?"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
          ></textarea>
          <button
            type="submit"
            className="post-btn"
            disabled={!newPostContent.trim()}
          >
            Share
          </button>
        </form>

        {/* The Feed */}
        {isLoading ? (
          <p>Loading community feed...</p>
        ) : (
          <div className="community-feed">
            {posts.length === 0 ? (
              <p>No posts yet. Be the first to start the conversation!</p>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="post-card">
                  <div className="post-header">
                    {/* Notice how we access the joined profile username here */}
                    <span className="post-author">
                      @{post.profiles?.username || "Unknown Student"}
                    </span>
                    <span>
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="post-content">{post.content}</div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Community;
