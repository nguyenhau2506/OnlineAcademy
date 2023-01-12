import bcrypt from "bcryptjs";

const genPassword = (rawPass) => {
    const salt = bcrypt.genSaltSync(12);
    return bcrypt.hashSync(rawPass, salt);
}

const checkPassword = (rawPass, hashedPass) => {
    return bcrypt.compareSync(rawPass, hashedPass);
}

export default {
    genPassword,
    checkPassword
}