import db from "../utils/db.js";

const getAllCategories = async () => {
    const parent_cat = await db('categories').select(["cat_id", "cat_name", "slug"]).whereNull('parent_cat_id');
    const categories = await Promise.all(parent_cat.map(async (cat) => {
        cat.children = await db('categories')
            .select(["cat_id", "cat_name", "slug"])
            .where('parent_cat_id', cat.cat_id);
        return cat;
    }));
    return categories;
}

const getCoursesByCatId = async (slug) => {
    console.log(slug);
    const cat_id = await db("categories").select("cat_id").where("slug", "/"+slug);
    console.log(cat_id);
    return await db("courses").select().where("cat_id", cat_id[0].cat_id);
}


export default {
    getCoursesByCatId,
    getAllCategories,
}