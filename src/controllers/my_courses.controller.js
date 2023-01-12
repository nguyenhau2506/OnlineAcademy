import MyCoursesService from "../services/my_courses.service.js";

const getWatchListPage = async (req, res) => {
    const currentPage = req.params.page || 1;
    const maxCoursePerRow = 4;
    const maxCoursePerPage = 8;
    const offset = (currentPage - 1) * maxCoursePerPage;
    let count = await MyCoursesService.countAllWatchListCourses(req.user.id);
    let courses = await MyCoursesService.getMyWatchList(req.user.id, offset, maxCoursePerPage);
    const row = [];
    console.log(courses)

    while(courses.length) row.push(courses.splice(0, maxCoursePerRow));
    res.render('student/watch_list', {
        layout: "main",
        currentPage,
        pages: Math.ceil(count / maxCoursePerPage) + 1,
        maxPage: Math.ceil(count / maxCoursePerPage),
        row,
    });
}

const getLearningPage = async (req, res) => {
    const currentPage = req.params.page || 1;
    const maxCoursePerRow = 4;
    const maxCoursePerPage = 8;
    const offset = (currentPage - 1) * maxCoursePerPage;
    let count = await MyCoursesService.countAllLearningCourses(req.user.id);
    let courses = await MyCoursesService.getMyLearningCourse(req.user.id, offset, maxCoursePerPage);
    console.log(courses)
    const row = [];
    while(courses.length) row.push(courses.splice(0, maxCoursePerRow));
    res.render('student/learning', {
        layout: "main",
        currentPage,
        pages: Math.ceil(count / maxCoursePerPage) + 1,
        maxPage: Math.ceil(count / maxCoursePerPage),
        row,
    });
}

const addToWatchList = async (req, res) => {
    try{
        const userId = req.user.id;
        await MyCoursesService.addToWatchList(userId, req.body.id);
        return res.redirect(req.headers.referrer || req.headers.referer);
    }catch (err) {console.log(err)}
}

const removeFromWatchList = async (req, res) => {
    try{
        const userId = req.user.id;
        await MyCoursesService.removeFromWatchList(userId, req.body.id);
        return res.redirect(req.headers.referrer || req.headers.referer);
    }catch (err) {console.log(err)}
}


export default {
    getLearningPage,
    getWatchListPage,
    removeFromWatchList,
    addToWatchList
}