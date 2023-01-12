export function ensureVerifiedEmail(req, res, next) {
    // req.session.retUrl = req.originalUrl;
    next();
    if (req.user.isVerified === false) {
        // res.redirect("/auth/verification");
    }
}

export function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.set("X-Auth-Required", "true");
    req.session.retUrl = req.originalUrl;
    res.redirect("/login");
}

export function ensureAdmin(req, res, next) {
    if (req.user.role === "ADMIN") {
        return next();
    }
    req.user;
    res.redirect("/");
}

export function ensureTeacher(req, res, next) {
    if (req.user.role === "TEACHER") {
        return next();
    }
    res.redirect("/");
}
export function ensureStudent(req, res, next) {
    if (req.user.role === "STUDENT") {
        return next();
    }
    return res.render("errors/403", { layout: "errors" });
}
