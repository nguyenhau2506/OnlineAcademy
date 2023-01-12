import courseDetailService from "../services/course.service.js";

const getCourseDetailPage = async(req, res) => {
    const courseInfo = await courseDetailService.getCourseBySlug(req.params.slug);
    const teacher= await courseDetailService.getTeacherByCourseId(courseInfo[0].teacher_id);
    console.log(teacher);
    let chapter = await Promise.all(courseInfo.map(async ({id}) => {
        return await courseDetailService.getAllChapterInCourse(id);
    } ));

    // const list = [];
    // list.push(teacher);

   console.log(chapter[0]);
    res.render("vwCourses/detail", { 
        layout: "main",
        courseInfo,
        chapter: chapter[0],
        teacher,
    });
};

export default {
    getCourseDetailPage,
};