import express from "express";
import passport from "../utils/passport.js";
import multer from "multer";

const upload = multer();
const router = express.Router();
import authController from "../controllers/auth.controller.js";

router.use(authController.setAuthLayout);

/* GET login page. */
router.get("/login", authController.getLoginPage);

/* POST login with password */
router.post(
    "/login/with-password",
    passport.authenticate("local-login", {
        failureRedirect: "/login",
        failureMessage: true,
    }),
    authController.loginWithPassword
);

/* GET login with Facebook. */
router.get("/login/with-facebook", passport.authenticate("fb-login"));

router.get(
    "/login/with-facebook/redirect",
    passport.authenticate("fb-login", {
        failureRedirect: "/login",
        failureMessage: true,
    }),
    authController.loginWithPassword
);

/* GET login with Google. */
router.get("/login/with-google", passport.authenticate("gg-login"));

router.get(
    "/login/with-google/redirect",
    passport.authenticate("gg-login", {
        failureRedirect: "/login",
        failureMessage: true,
    }),
    authController.loginWithPassword
);

/* GET signup page. */
router.get("/signup", authController.getSignupPage);
router.post(
    "/signup/with-password",
    passport.authenticate("local-signup", {
        failureRedirect: "/signup",
        failureMessage: true,
    }),
    authController.signUp
);

/* GET signup with Facebook. */
router.get("/signup/with-facebook", passport.authenticate("fb-signup"));

router.get(
    "/signup/with-facebook/redirect",
    passport.authenticate("fb-signup", {
        failureRedirect: "/signup",
        failureMessage: true,
    }),
    authController.loginWithPassword
);

/* GET signup with Google. */
router.get("/signup/with-google", passport.authenticate("gg-signup"));

router.get(
    "/signup/with-google/redirect",
    passport.authenticate("gg-signup", {
        failureRedirect: "/signup",
        failureMessage: true,
    }),
    authController.signUp
);

/* POST logout */
router.post("/logout", function (req, res, next) {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.session.auth = false;
        req.session.authUser = null;

        const url = req.headers.referer || "/";
        res.redirect(url);
    });
});
router.post("/teacher-logout", function (req, res, next) {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.session.auth = false;
        req.session.authUser = null;

        const url = "/";
        res.redirect(url);
    });
});

router.get(
    "/email/send-verify",
    passport.authenticate("email_verify", {
        action: "requestToken",
        failureRedirect: "/",
    }),
    function (req, res) {
        res.redirect("/email/verify/check");
    }
);

router.get("/email/verify/check", function (req, res) {
    res.send("Wait");
    // res.render("email_verify")
})

router.get('/email/verify', passport.authenticate('email_verify', {
    successReturnToOrRedirect: '/',
    failureRedirect: '/login'
}));

router.get("/verification", function (req, res) {
    res.send("Need verify your email")
})

export default router;
