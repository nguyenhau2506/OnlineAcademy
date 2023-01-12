import db from "../utils/db.js";

const checkLinkedAccount = async (provider, subject) => {
    const cred = await db("federated_credentials")
        .where("provider", provider)
        .andWhere("subject", subject)
        .select("user_id");

    if (cred.length === 0) return null;
    return cred[0];
};

const addLinkedAccount = (credential) => {
    return db("federated_credentials").insert(credential).returning("id");
};

const findUserByEmail = async (email) => {
    const users = await db("users").where("email", email);
    if (users.length === 0) return null;
    return users[0];
};

const findUserById = async (id) => {
    const users = await db("users").where("id", id);
    if (users.length === 0) return null;
    return users[0];
};

const add = async (user) => {
    return db("users").insert(user).returning("*");
};

const update = async (user) => {
    const user_id = user.id;
    delete user.id;
    return await db("users").where("id", user_id).update(user).returning("id");
};

const enrollCourse = async (userId, courseId) => {
    return await db("courses_own").insert({
        student_id: userId,
        course_id: courseId,
    });
};

export default {
    checkLinkedAccount,
    addLinkedAccount,
    findUserByEmail,
    findUserById,
    add,
    update,
    enrollCourse,
};
