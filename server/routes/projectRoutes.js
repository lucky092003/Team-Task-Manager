import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";
import { createProject, deleteProject, listProjects, updateProject } from "../controllers/projectController.js";

const router = express.Router();

router.get("/", protect, listProjects);
router.post("/", protect, isAdmin, createProject);
router.put("/:id", protect, isAdmin, updateProject);
router.delete("/:id", protect, isAdmin, deleteProject);

export default router;