import categoriesService from "../services/categories.service.js";
import myCoursesService from "../services/my_courses.service.js";

const getCourses = async(req, res) => {
    let name = req.params.slug;
    name = name.replace("-", " ");
    let courses = await categoriesService.getCoursesByCatId(req.params.slug);
    if (courses && req.session.auth) {
        courses = await Promise.all(courses.map(async (course) => {
            course.is_watchlist = await myCoursesService.isInMyWatchList(req.user.id, course.id);
            return course;
        }));
    }
    res.render("vwCategory/categories.hbs", {
        layout: "main",
        courses,
        name
    });
};

export default {
    getCourses,
};