import express from "express";

import teacherController from "../controllers/teacher.controller.js";

const router = express.Router();
router.get("/teacher-profile", teacherController.getTeacherProfile);
router.post("/teacher-profile", teacherController.editTeacherProfile);
router.get("/teacher-update-course/:id", teacherController.getPageUpdateCourse);
router.post("/teacher-update-course/:id", teacherController.updateCourse);
router.get("/course", teacherController.getCourseByTeacherId);
router.get("/detail-course/course/:slug", teacherController.getCourseSlug);

router.post("/course", teacherController.addNewCourse);

export default router;
