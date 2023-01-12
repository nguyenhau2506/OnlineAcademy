import db from "../utils/db.js";
export default {
    getTeacherProfile(userId) {
        return db.select("*").table("users").where("id", userId);
    },
    changeProfile(teacher, teacherId) {
        return db("users").update(teacher).where("id", teacherId);
    },
    getNumberStudent(teacherId) {
        return db
            .sum("students_learning")
            .table("courses")
            .where("teacher_id", teacherId);
    },
};
