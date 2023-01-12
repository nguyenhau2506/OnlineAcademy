import express from "express";
import courseService from "../services/course.service.js";
import myCoursesService from "../services/my_courses.service.js";

const router = express.Router();

/* GET home page. */
router.get("/", async function (req, res, next) {
    if (req.session.auth) {
        console.log(req.user.role);
        if (req.user.role === "TEACHER") {
            return res.redirect("/teacher/teacher-profile");
        }
        if (req.session.passport.user.role === "ADMIN") {
            return res.render("teacher/teacher-profile", {
                layout: "adminLayout",
            });
        }
        let coursesPopular = await courseService.getPopularCoursesInLastWeek();
        let coursesNewest = await courseService.getNewestCourses();
        const catPopular = await courseService.getCategoriesPopular();

        coursesPopular = await Promise.all(coursesPopular.map(async (course) => {
            course.is_watchlist = await myCoursesService.isInMyWatchList(req.user.id, course.id);
            return course;
        }));

        coursesNewest = await Promise.all(coursesPopular.map(async (course) => {
            course.is_watchlist = await myCoursesService.isInMyWatchList(req.user.id, course.id);
            return course;
        }));

        console.log(coursesNewest.length);
        return res.render("home", {
            coursesPopular,
            coursesNewest,
            catPopular
        });
    }
    const coursesPopular = await courseService.getPopularCoursesInLastWeek();
    const coursesNewest = await courseService.getNewestCourses();
    const catPopular = await courseService.getCategoriesPopular();
    console.log(coursesNewest.length);
    res.render("home", {
        coursesPopular,
        coursesNewest,
        catPopular
    });
});

router.get("/search", async (req, res) => {
    const keyword = req.query.keyword;
    return res.redirect(`/search/pages?keyword=${keyword}&page=1`);
})
router.get("/search/pages", async (req, res) => {
    const keyword = req.query.keyword;
    const currentPage = req.query.page || 1;
    const maxCoursePerRow = 4;
    const maxCoursePerPage = 8;
    const offset = (currentPage - 1) * maxCoursePerPage;
    const courses = await courseService.fullTextSearchCourse(keyword);
    let count = 0;
    let row = false;
    if (courses) {
        row = []
        count = courses.length;
        while(courses.length) row.push(courses.splice(offset, maxCoursePerRow));
    }

    res.render("search_result", {
        layout: "main",
        currentPage,
        pages: Math.ceil(count / maxCoursePerPage) + 1,
        maxPage: Math.ceil(count / maxCoursePerPage),
        row,
    });
})

export default router;
