import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import expressLayouts from "express-ejs-layouts";

import imagesRoutes from "./routes/imagesRoutes.js";
import scoresRoutes from "./routes/scoresRoutes.js";
import sessionsRoutes from "./routes/sessionsRoutes.js";

const app = express();

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(expressLayouts);

// Default layout file (default is views/layout.ejs)
app.set("layout", "layouts/layout");

// Serve static files
app.use("/public", express.static(join(__dirname, "public")));

// API routes
app.use("/api/images", imagesRoutes);
app.use("/api/scores", scoresRoutes);
app.use("/api/sessions", sessionsRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  
  // Log for debugging
  const errorDetails = {
    message: err.message || "Unknown error",
    status: err.status || err.statusCode || 500,
    path: req.path,
    method: req.method,
  };
  
  console.error("Error Details:", errorDetails);
  
  if (req.path.startsWith("/api/")) {
    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({ 
      error: err.message || "Internal server error",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    });
  } else {
    res.status(500).json({ error: "Internal server error" });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

export default app; 