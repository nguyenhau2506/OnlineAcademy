import express from "express";
import courseController from "../controllers/course.controller.js";
const router = express.Router();

router.get("/:slug", courseController.getCourseDetailPage);

export default router;