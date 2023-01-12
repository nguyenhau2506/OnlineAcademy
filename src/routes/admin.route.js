import express from "express";
import categoryModel from "../services/catelogies.service.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import userService from "../services/users.service.js";
const router = express.Router();
router.get("/", function (req, res, next) {
    res.render("admin/index", { layout: "adminLayout" });
});
function convertToSlug(Text) {
    return Text.toLowerCase()
        .replace(/[^\w ]+/g, "")
        .replace(/ +/g, "-");
}
router.get("/courses", async (req, res, next) => {
    const teacher = req.query.teacher ? req.query.teacher : "all";
    const cate = req.query.cate ? req.query.cate : "all";
    console.log(teacher, cate);
    console.log(req.query.params);
    var listCourse;
    if (teacher == "all" && cate == "all") {
        listCourse = await categoryModel.findAllCourse();
    } else if (cate != "all" && teacher == "all") {
        listCourse = await categoryModel.findCoursebyCate(cate);
    } else if (cate == "all" && teacher != "all") {
        listCourse = await categoryModel.findCoursebyTeacher(teacher);
    } else {
        // find by cate and teacher
        listCourse = await categoryModel.findCoursebyTeacherandCate(
            cate,
            teacher
        );
    }
    console.log(listCourse);
    const listCate = await categoryModel.findAll();
    const listTeacher = await categoryModel.getAllTeacher();
    // console.log(list)
    res.render("admin/viewCourseadnFilter", {
        layout: "adminLayout",
        isEmpty: listCourse.length == 0,
        course: listCourse,
        categories: listCate,
        teachers: listTeacher,
        teacher: teacher,
        cate: cate,
    });
});
router
    .route("/categories")
    .get(async (req, res, next) => {
        let total = await categoryModel.findAll();

        let categiries = total;
        if (categiries) {
            for (let i = 0; i < categiries.length; i++) {
                console.log(categiries[i].cat_id);
                const amount_course = await categoryModel.getAmountCourse(
                    categiries[i].cat_id
                );
                const amount_children = await categoryModel.getAmountChild(
                    categiries[i].cat_id
                );
                categiries[i].amount_course = amount_course;
                categiries[i].amount_children = amount_children;
            }
        }
        res.render("admin/catelogy", {
            layout: "adminLayout",
            categogies: categiries,
            isEmpty: categiries.length == 0,
        });
    })
    .post(async function (req, res) {
        console.log(crypto.randomInt(100000));
        const categories = req.body;
        categories.slug = await categoryModel.generateSlug(categories.cat_name);
        categoryModel.add(categories);
        res.redirect("/admin/categories");
    });
router.get("/categories/edit/:slug", async function (req, res) {
    const { slug } = req.params;
    const category = await categoryModel.findbySlug(slug);
    console.log(category);
    if (category === null) return res.redirect("/admin/categories");
    res.render("admin/categogiedit", {
        layout: "adminLayout",
        category: category,
    });
});
router.get("/categories/add", async function (req, res) {
    res.render("admin/categoriAdd", {
        layout: "adminLayout",
    });
});

router
    .route("/categories/:slug")
    .post(async function (req, res) {
        const categories = req.body;
        const { slug } = req.params;
        const category = await categoryModel.findbySlug(slug);
        console.log(category);
        console.log(categories);
        category.cat_name = categories.cat_name;
        console.log(categoryModel.patch(category));
        // find cate id and update categories.cat_name
        res.redirect("/admin/categories");
    })
    .delete(async function (req, res) {
        const { slug } = req.params;
        const category = await categoryModel.findbySlug(slug);
        const amount_course = await categoryModel.getAmountCourse(
            category.cat_id
        );
        const amount_children = await categoryModel.getAmountChild(
            category.cat_id
        );
        if (amount_course == 0 && amount_children == 0) {
            await categoryModel.del(category.cat_id);
            return res.status(200).json({ message: "delete success" });
        }
        return res.status(400).json({ message: "delete fail" });
        //check amount course of cate
    });
router.post("/updateuser", async (req, res, next) => {
    const user = req.body;
    const role = user.role;
    user.is_verified = user.is_verified == "true" ? true : false;
    console.log(user);
    categoryModel.updateUser(user);
    if (role == "STUDENT") res.redirect("/admin/users");
    else if (role == "TEACHER") res.redirect("/admin/teachers");
});
router.get("/users", async (req, res, next) => {
    const page = req.query.page | 0;
    console.log(page);
    const list = await categoryModel.getAllStudent(page);
    var prevpage = page > 0 ? page - 1 : 0;
    var nextpage = page + 1;
    if (list.length < 6) nextpage = page;
    // const total = await categoryModel.findAll();
    res.render("admin/studentAdmin", {
        layout: "adminLayout",
        users: list,
        isEmpty: list.length == 0,
        prevpage: prevpage,
        nextpage: nextpage,
    });
});
router.get("/viewuser/:id", async (req, res, next) => {
    const { id } = req.params;
    // find user by id
    const finduser = await categoryModel.findStudentById(id);

    // const total = await categoryModel.findAll();
    res.render("admin/viewuser", { layout: "adminLayout", user: finduser });
});
router.get("/viewCategories/:slug", async (req, res, next) => {
    const { slug } = req.params;
    const total = await categoryModel.findbySlug(slug);
    // get course and render
    res.render("admin/viewuser", { layout: "adminLayout", user: total });
});
router.get("/teachers/add", async function (req, res, next) {
    res.render("admin/addTeacherAccount", { layout: "adminLayout" });
});
router.post("/teachers", async function (req, res, next) {
    const newTeacher = req.body;
    console.log(newTeacher);
    const user = await userService.findUserByEmail(newTeacher.email);
    console.log(user);
    if (user) {
        return res.render("admin/addTeacherAccount", {
            layout: "adminLayout",
            errMessage: "Duplicate gmail",
            user,
        });
    }
    const salt = bcrypt.genSaltSync(12);
    const hashed = bcrypt.hashSync(newTeacher.password, salt);

    const newUser = {}; //new UserModel();
    newUser.email = newTeacher.email;
    newUser.password = hashed;
    newUser.fullname = newTeacher.fullname;
    newUser.role = "TEACHER";
    console.log(newUser);
    userService.add(newUser);
    return res.redirect("/admin/teachers");
});
router.get("/teachers", async function (req, res, next) {
    const page = req.query.page | 0;
    console.log(page);
    const list = await categoryModel.getAllTeacher(page);
    var prevpage = page > 0 ? page - 1 : 0;
    var nextpage = page + 1;
    if (list.length < 6) nextpage = page;
    // const total = await categoryModel.findAll();
    res.render("admin/teacherAdmin", {
        layout: "adminLayout",
        users: list,
        isEmpty: list.length == 0,
        prevpage: prevpage,
        nextpage: nextpage,
    });
});

export default router;
