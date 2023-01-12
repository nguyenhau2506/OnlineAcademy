const setAuthLayout = (req, res, next) => {
    res.locals.layout = "auth.layout.hbs";
    next();
};

const getLoginPage = (req, res) => {
    const errMessage = req.session.messages?.at(-1);
    req.session.messages = [];

    res.render("login", {
        title: "academyX - Login",
        errMessage,
    });
};

const getSignupPage = (req, res) => {
    const errMessage = req.session.messages?.at(-1);
    req.session.messages = [];

    res.render("signup", {
        title: "academyX - Signup",
        errMessage,
    });
};

const loginWithPassword = (req, res) => {
    req.session.auth = true;
    if (req.user.role === "TEACHER") {
        return res.redirect("/teacher/teacher-profile");
    } else if (req.user.role === "ADMIN") {
        return res.redirect("/admin/courses?cate=all&teacher=all");
    }
    const url = req.session.retUrl || "/";
    delete req.session.retUrl;
    return res.redirect(url);
};

const signUp = async (req, res, next) => {
    req.session.auth = true;
    const url = req.session.retUrl || "/";
    delete req.session.retUrl;
    return res.redirect(url);
};

export default {
    setAuthLayout,
    getLoginPage,
    getSignupPage,
    loginWithPassword,
    signUp,
};
