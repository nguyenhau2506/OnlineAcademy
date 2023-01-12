import courseService from "../services/course.service.js";
import teacherService from "../services/teacher.service.js";
import accountController from "./account.controller.js";
import multer from "multer";
import path from "path";
const getTeacherProfile = async (req, res, next) => {
    const userId = req.user.id; // la xong
    const teacherProfile = await teacherService.getTeacherProfile(userId);

    res.render("teacher/teacher-profile", {
        layout: "teacherLayout",
        teacher: teacherProfile,
    });
};

const editTeacherProfile = async (req, res, next) => {
    const changeTeacher = req.body;
    const teacherid = req.user.id;

    if (changeTeacher.oldPass == null) {
        await teacherService.changeProfile(changeTeacher, teacherid);
    } else {
        accountController.changePassword(req, res, next);
    }

    res.redirect("/teacher/teacher-profile");
};
const getPageUpdateCourse = async (req, res, next) => {
    const id = req.params.id;
    const course = await courseService.getCourseById(id);
    console.log(course);
    const chapters = await courseService.getChapterByCourseId(id);

    return res.render("teacher/teacher-update-course", {
        layout: "teacherLayout",
        chapters: chapters,
        course: course,
    });
};
const updateCourse = async (req, res, next) => {
    const id = req.params.id;
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, "./public/uploads/");
        },
        filename: function (req, file, cb) {
            const fileName = req.body.name.replace(/ /g, "");
            const chapters = req.body.chapter.replace(/ /g, "");
            const lesson = req.body.lesson.replace(/ /g, "");
            cb(
                null,
                fileName +
                    "_" +
                    chapters +
                    "_" +
                    lesson +
                    path.extname(file.originalname)
            );
        },
    });
    const upload = multer({ storage: storage });
    upload.array("videoURL", 2)(req, res, async function (err) {
        const course = req.body;
        const position = await courseService.getPosition(id);

        if (position == null) {
            course.position = 1;
        } else {
            course.position = position.position + 1;
        }

        const chapter = await courseService.addChapter(
            id,
            course.chapter,
            course.position
        );
        console.log(chapter);

        const lessonUrl =
            "/public/uploads/" +
            course.name.replace(/ /g, "") +
            "_" +
            course.chapter.replace(/ /g, "") +
            "_" +
            course.lesson.replace(/ /g, "") +
            ".mp4";
        const lesson_position = await courseService.getLessonPosition(
            chapter.id
        );
        if (lesson_position == null) {
            course.lesson_position = 1;
        } else {
            course.lesson_position = lesson_position.lesson_position + 1;
        }

        const addLesson = await courseService.addLesson(
            course.lesson,
            lessonUrl,
            chapter.id,
            course.lesson_position
        );
        console.log(course);
        const update = await courseService.updateCourse(id, course);
        if (err instanceof multer.MulterError) {
            console.log(err);
        } else if (err) {
            console.error(err);
        }
    });

    res.redirect("/teacher/course");
};
const getCourseByTeacherId = async (req, res, next) => {
    const courses = await courseService.getCourseByTeacherId(req.user.id);

    res.render("teacher/teacher-course", {
        layout: "teacherLayout",
        courses: courses,
    });
};
const addNewCourse = async (req, res, next) => {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, "./public/uploads");
        },
        filename: function (req, file, cb) {
            const fileName = req.body.name.replace(/ /g, "");
            cb(null, fileName + path.extname(file.originalname));
        },
    });

    const upload = multer({ storage: storage });
    upload.array("inputFile", 2)(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            console.log(err);
        } else if (err) {
            console.error(err);
        }
        const course = req.body;
        const slug = await courseService.getSlug(course.cat_id);
        course.slug = "/course" + "/" + course.name.replace(/ /g, "") + "/";
        const fileName = course.name.replace(/ /g, "");
        course.preview_video = "/public/uploads/" + fileName + ".mp4";
        course.thumbnail = "/public/uploads/" + fileName + ".jpg";
        const addCourse = await courseService.addCourse(course, req.user.id);
    });

    res.redirect("/teacher/course");
};
const getCourseSlug = async (req, res) => {
    console.log(req.params.slug);
    const courseInfo = await courseService.getCourseBySlug(req.params.slug);
    console.log(courseInfo);
    const teacher = await courseService.getTeacherByCourseId(
        courseInfo[0].teacher_id
    );
    console.log(teacher);
    let chapter = await Promise.all(
        courseInfo.map(async ({ id }) => {
            return await courseService.getAllChapterInCourse(id);
        })
    );

    res.render("teacher/previewCourse", {
        layout: "main",
        courseInfo,
        chapter: chapter[0],
        teacher,
    });
};
export default {
    getCourseSlug,
    getTeacherProfile,
    editTeacherProfile,
    getPageUpdateCourse,
    updateCourse,
    getCourseByTeacherId,
    addNewCourse,
};
