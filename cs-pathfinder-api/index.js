// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pathRoutes from "./routes/pathRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";

// Initialize environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allows the React frontend (running on a different port) to make requests
app.use(express.json()); // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/paths", pathRoutes);
app.use("/api/community", communityRoutes);

// Basic health check route
app.get("/", (req, res) => {
  res.json({ message: "CS Pathfinder API is running smoothly." });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
