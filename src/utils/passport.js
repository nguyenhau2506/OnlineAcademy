import passport from "passport";
import LocalStrategy from "passport-local";
import FacebookStrategy from "passport-facebook";
import GoogleStrategy from "passport-google-oauth20";
import MagicLinkStrategy from "passport-magic-link";
import sendgrid from "@sendgrid/mail";
import MailSender from "./mail_sender.js";

import dotenv from "dotenv";

import userService from "../services/users.service.js";
import UserModel from "../models/user.model.js";
import { getAvatarByName, getAvatarWithUrl } from "../utils/helpers.js";
import Hash from "../utils/hash.js";

dotenv.config();

const authPassport = passport;
sendgrid.setApiKey(process.env["SENDGRID_API_KEY"]);

/* Set up passport */

/* LOCAL */
authPassport.use(
    "local-login",
    new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password",
        },
        async function verify(email, password, cb) {
            try {
                const user = await userService.findUserByEmail(email);
                if (!user) {
                    return cb(null, false, {
                        message: "Incorrect username or password.",
                    });
                }

                if (!Hash.checkPassword(password, user.password)) {
                    return cb(null, false, {
                        message: "Incorrect username or password.",
                    });
                }

                user.password = null;
                return cb(null, user);
                // return cb(null, false, {message: 'Login success'});
            } catch (err) {
                return cb(err);
            }
        }
    )
);

authPassport.use(
    "local-signup",
    new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password",
            passReqToCallback: true,
        },
        async function verify(req, email, password, cb) {
            console.log(email, password, req.body.fullname);
            try {
                const user = await userService.findUserByEmail(email);
                if (user) {
                    return cb(null, false, {
                        message: "Account already exist!!!",
                    });
                    // req.session.messages.push("Account already exists");
                    // return res.redirect("/signup");
                }

                const newUser = {};
                newUser.password = Hash.genPassword(password);
                newUser.email = email;
                newUser.role = "STUDENT";
                newUser.fullname = req.body.fullname;

                userService.add(newUser).then((result) => {
                    return cb(null, result[0]);
                    // return cb(null, false, "An error was occurred. Retry later!!!")
                });
            } catch (err) {
                return cb(null, false, "An error was occurred. Retry later!!!");
            }
        }
    )
);

authPassport.use(
    "email_verify",
    new MagicLinkStrategy.Strategy(
        {
            secret: "keyboard cat",
            userFields: ["email"],
            tokenField: "token",
            verifyUserAfterToken: true,
        },
        function send(user, token) {
            const link = "http://localhost:5050/email/verify?token=" + token;
            const msg = {
                to: user.email,
                from: process.env["EMAIL"],
                subject: "Verify your email",
                text:
                    "Hello! Click the link below to finish verifying email of academyX account.\r\n\r\n" +
                    link,
                html:
                    '<h3>Hello!</h3><p>Click the link below to finish verifying email of academyX account.</p><p><a href="' +
                    link +
                    '">Verify email</a></p>',
            };
            return MailSender.sendMail(msg, function (err, info) {
                if (err) return Promise.resolve(err);
                console.log(info);
            });
        },
        function verify(user) {
            return console.log("SEND EMAIL", user);
        }
    )
);

/* FACEBOOK */
authPassport.use(
    "fb-login",
    new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
            callbackURL: "/login/with-facebook/redirect",
            profileFields: [
                "id",
                "displayName",
                "picture.type(large)",
                "email",
            ],
        },
        async function (accessToken, refreshToken, profile, cb) {
            const cred = await userService.checkLinkedAccount(
                "https://www.facebook.com",
                profile.id
            );
            if (!cred) {
                return cb(null, false, {
                    message: "Account don't exist.Please sign up first!",
                });
            } else {
                const user = await userService.findUserById(cred.user_id);
                if (!user) return cb(null, false);

                user.photo = profile.photos[0].value;
                return cb(null, user);
            }
        }
    )
);

authPassport.use(
    "fb-signup",
    new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
            callbackURL: "/signup/with-facebook/redirect",
            profileFields: [
                "id",
                "displayName",
                "picture.type(large)",
                "email",
            ],
        },
        async function (accessToken, refreshToken, profile, cb) {
            const cred = await userService.checkLinkedAccount(
                "https://www.facebook.com",
                profile.id
            );
            if (!cred) {
                // If user has register with that email
                // Add linked to facebook
                const user = await userService.findUserByEmail(
                    profile.emails[0].value
                );
                if (user) {
                    await userService.addLinkedAccount({
                        user_id: user.id,
                        provider: "https://www.facebook.com",
                        subject: profile.id,
                    });

                    user.photo = profile.photos[0].value;
                    return cb(null, user);
                }

                // Else create new user with that linked facebook account
                userService
                    .add({
                        fullname: profile.displayName,
                        email: profile.emails[0].value,
                        is_verified: true,
                    })
                    .then(async (newUser) => {
                        await userService.addLinkedAccount({
                            user_id: newUser[0].id,
                            provider: "https://www.facebook.com",
                            subject: profile.id,
                        });

                        newUser[0].photo = profile.photos[0].value;
                        return cb(null, newUser[0]);
                    })
                    .catch(cb);
            } else {
                return cb(null, false, {
                    message: "Account is already exist!!!",
                });
            }
        }
    )
);

/* GOOGLE */
authPassport.use(
    "gg-login",
    new GoogleStrategy.Strategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/login/with-google/redirect",
            scope: ["profile", "email"],
            profileFields: ["id", "displayName", "photos", "email"],
        },
        async function verify(accessToken, refreshToken, profile, cb) {
            const cred = await userService.checkLinkedAccount(
                "https://accounts.google.com",
                profile.id
            );

            if (!cred) {
                return cb(null, false, {
                    message: "Account don't exist. Please sign up first!",
                });
            } else {
                const user = await userService.findUserById(cred.user_id);
                user.photo = profile.photos[0].value;

                if (!user) return cb(null, false);
                return cb(null, user);
            }
        }
    )
);

authPassport.use(
    "gg-signup",
    new GoogleStrategy.Strategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/signup/with-google/redirect",
            scope: ["profile", "email"],
            profileFields: ["id", "displayName", "photos", "email"],
        },
        async function verify(accessToken, refreshToken, profile, cb) {
            const cred = await userService.checkLinkedAccount(
                "https://accounts.google.com",
                profile.id
            );

            if (!cred) {
                // If user has register with that email
                // Add linked to Google
                const user = await userService.findUserByEmail(
                    profile.emails[0].value
                );
                if (user) {
                    await userService.addLinkedAccount({
                        user_id: user.id,
                        provider: "https://accounts.google.com",
                        subject: profile.id,
                    });
                    user.photo = profile.photos[0].value;
                    return cb(null, user);
                }

                // Else create new user with that linked Google account
                userService
                    .add({
                        fullname: profile.displayName,
                        email: profile.emails[0].value,
                        is_verified: true,
                    })
                    .then(async (newUser) => {
                        await userService.addLinkedAccount({
                            user_id: newUser[0].id,
                            provider: "https://accounts.google.com",
                            subject: profile.id,
                        });

                        newUser[0].photo = profile.photos[0].value;
                        return cb(null, newUser[0]);
                    })
                    .catch(cb);
            } else {
                return cb(null, false, {
                    message: "Account is already exist!!!",
                });
            }
        }
    )
);

authPassport.serializeUser(function (user, cb) {
    process.nextTick(async function () {
        if (user.photo)
            await getAvatarWithUrl(
                user.photo,
                "./public/images/user_avatar.png"
            );
        else
            await getAvatarByName(
                user.fullname,
                "./public/images/user_avatar.png"
            );
        cb(null, {
            id: user.id,
            email: user.email,
            fullname: user.fullname,
            role: user.role,
            photo: user.photo,
            isVerified: user.is_verified,
        });
    });
});

authPassport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});

export default authPassport;
