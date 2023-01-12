import db from "../utils/db.js";

const getMyLearningCourse = async (studentId, offset, limit) => {
    const courses = db('courses')
        .join('courses_own', {'courses_own.course_id': "courses.id"})
        .join('categories', {'categories.cat_id' : 'courses.cat_id'})
        .join('users', {"users.id" : "courses.teacher_id"})
        .where('courses_own.student_id', studentId)
        .select(["courses.*", "categories.cat_name", "categories.parent_cat_id", "users.fullname as teacher_name"]);

    if (offset) courses.offset(offset);
    if (limit) courses.limit(limit);
    await courses;
    if (courses.length === 0) return null;
    return courses;
}

const getMyWatchList = async (studentId, offset, limit) => {
    const courses = db('courses')
        .join('watch_list', {'watch_list.course_id': "courses.id"})
        .join('categories', {'categories.cat_id' : 'courses.cat_id'})
        .join('users', {"users.id" : "courses.teacher_id"})
        .where('watch_list.student_id', studentId)
        .select(["courses.*", "categories.cat_name", "categories.parent_cat_id", "users.fullname as teacher_name"]);
    if (offset) courses.offset(offset);
    if (limit) courses.limit(limit);
    await courses;
    if (courses.length === 0) return null;
    return courses;
}

const removeFromWatchList = async (studentId, id) => {
    return db('watch_list')
            .where('student_id', studentId)
            .andWhere("course_id", id)
            .del();
}

const addToWatchList = async (studentId, id) => {
    return db('watch_list').insert({'student_id' : studentId, 'course_id': id});
}

const countAllLearningCourses = async (studentId) => {
    const result = await db('courses_own')
        .where("student_id", studentId)
        .count();
    return result[0].count;
}

const countAllWatchListCourses = async (studentId) => {
    const result = await db('watch_list')
        .where("student_id", studentId)
        .count();
    return result[0].count;
}

const getLearningCourseById = async (studentId, courseId) => {
    const result = await db('courses_own')
        .where("student_id", studentId)
        .andWhere('course_id', courseId);
    if (result.length === 0) return null;
    return result[0];
}

const isInMyWatchList = async (studentId, courseId) => {
    const course = await db('watch_list').select("*")
        .where("student_id", studentId)
        .andWhere("course_id", courseId)
        .returning("watch_list.course_id");
    if (course.length === 0) return false;
    return true;
}

export default {
    getLearningCourseById,
    getMyLearningCourse,
    getMyWatchList,
    removeFromWatchList,
    countAllLearningCourses,
    countAllWatchListCourses,
    addToWatchList,
    isInMyWatchList
}