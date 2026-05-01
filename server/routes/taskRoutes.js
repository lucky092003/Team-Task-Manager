import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createTask, deleteTask, listTasks, updateTask } from "../controllers/taskController.js";

const router = express.Router();

router.get("/", protect, listTasks);
router.post("/", protect, createTask);
router.put("/:id", protect, updateTask);
router.delete("/:id", protect, deleteTask);

export default router;