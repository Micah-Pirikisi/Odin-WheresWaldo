import "dotenv/config";
import express from "express";
import cors from "cors";
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
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(expressLayouts);

// Default layout file (default is views/layout.ejs)
app.set("layout", "layouts/layout");

// Serve static files
app.use("/public", express.static(join(__dirname, "public")));

// API routes
app.use("api/images", imagesRoutes);
app.use("/api/scores", scoresRoutes);
app.use("/api/sessions", sessionsRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  if (req.path.startsWith("/api/")) {
    res
      .status(err.status || 500)
      .json({ error: err.message || "Internal server error" });
  }
});
