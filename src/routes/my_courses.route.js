import express from "express";

import MyCoursesController from "../controllers/my_courses.controller.js";

const router = express.Router();

/* GET my courses watch list */
router.get('/watch-list', (req, res) => res.redirect('/my-courses/watch-list/pages/1'));
router.get('/watch-list/pages/:page', MyCoursesController.getWatchListPage);

router.post("/watch-list/remove-watchlist", MyCoursesController.removeFromWatchList);
router.post("/watch-list/add-watchlist", MyCoursesController.addToWatchList);

/* GET my courses learning list  */
router.get('/learning', (req, res) => res.redirect('/my-courses/learning/pages/1'));
router.get('/learning/pages/:page', MyCoursesController.getLearningPage);

export default router;