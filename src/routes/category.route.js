import express from "express";
import categoriesController from "../controllers/categories.controller.js";
const router = express.Router();

router.get("/:slug", categoriesController.getCourses);

export default router;