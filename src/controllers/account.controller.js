import usersService from "../services/users.service.js";
import Hash from "../utils/hash.js";
import passport from "../utils/passport.js";
import session from "express-session";

async function editAccount(req, res, next) {
    try {
        const { fullname, email } = req.body;
        const userId = await usersService.update({
            fullname,
            email,
            id: req.user.id,
        });
        const user = await usersService.findUserById(userId[0].id);

        delete user.password;
        delete user.created_at;
        delete user.updated_at;

        req.result = {
            type: "success",
            msg: "Đổi thông tin thành công",
            user,
        };
        next();
    } catch (error) {
        req.result = {
            type: "danger",
            msg: "Xảy ra lỗi đổi thông tin không thành công",
        };
        next(error);
    }
}

async function changePassword(req, res, next) {
    try {
        console.log(req.body);
        const { oldPass, newPass } = req.body;
        if (oldPass === newPass) return next();
        let user = await usersService.findUserById(req.user.id);
        if (!Hash.checkPassword(oldPass, user.password)) {
            req.result = {
                type: "warning",
                msg: "Mật khẩu cũ không chính xác.",
            };
            return next();
        }

        await usersService.update({
            id: user.id,
            password: Hash.genPassword(newPass),
        });
        req.result = {
            type: "success",
            msg: "Đổi mật khẩu thành công",
        };
        next();
    } catch (error) {
        req.result = {
            type: "danger",
            msg: "Xảy ra lỗi đổi mật khẩu không thành công",
        };
        next(error);
    }
}

export default {
    editAccount,
    changePassword,
};
