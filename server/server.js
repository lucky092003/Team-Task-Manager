import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 5000;

// Validate required environment variables
const requiredEnvVars = ["MONGO_URI", "JWT_SECRET"];
const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
);

if (missingEnvVars.length > 0) {
    console.error(
        `❌ Missing required environment variables: ${missingEnvVars.join(", ")}`
    );
    process.exit(1);
}

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());

// Serve client static files
app.use(express.static(path.join(__dirname, "../client/dist")));

app.get("/api/health", (_, res) => {
    res.json({ ok: true, service: "team-task-manager-server" });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

// Fallback to index.html for client-side routing
app.get("*", (_, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

connectDB(process.env.MONGO_URI)
    .then(() => {
        console.log("✓ MongoDB Connected");
        app.listen(port, () => console.log(`✓ Server running on port ${port}`));
    })
    .catch((err) => {
        console.error("❌ Database connection failed:", err.message);
        process.exit(1);
    });