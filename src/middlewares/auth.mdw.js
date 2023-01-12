import passport from "../utils/passport.js";

export function authWithRole(role) {
    return function (req, res, next) {
        if (!req.session.auth) {
            req.session.retUrl = req.originalUrl;
            return res.redirect("/login");
        }

        const authUser = req.session.authUser;
        if (authUser) {
            if (authUser.role != role) {
                console.log(403)
            }
        }

        next();
    }
};

export default function (app) {
    app.use(passport.authenticate('session'));
};



