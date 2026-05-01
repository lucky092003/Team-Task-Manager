import express from "express";
import { login, signup, me, listUsers } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, me);
router.get("/users", protect, isAdmin, listUsers);

export default router;
