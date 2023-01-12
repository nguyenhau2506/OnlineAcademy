import accountController from "../controllers/account.controller.js";
import usersService from "../services/users.service.js";
import MyCoursesService from "../services/my_courses.service.js";

const getAccountSettingPage = async (req, res) => {
    const result = req?.result;
    if (req?.result?.user) {
        req.user = req.result.user;
        req.session.passport.user = req.result.user;
    }

    res.render("student/account_setting", {
        result,
    });
};

const getChangePasswordPage = (req, res) => {
    const result = req?.result;
    req.result = null;

    res.render("student/change_password", {
        result,
    });
};

const enrollCourse = async (req, res) => {
    const userId = req.user.id;
    const courseId = req.body.id;

    const courses = await MyCoursesService.getLearningCourseById(userId, courseId);
    if (!courses)
        await usersService.enrollCourse(userId, courseId);
    else {
        return res.redirect("/learning/" + courseId);
    }

    return res.redirect(req.headers.referer || req.headers.referer);
};

export default {
    getAccountSettingPage,
    getChangePasswordPage,
    enrollCourse,
};
