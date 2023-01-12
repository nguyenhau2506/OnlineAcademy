import db from '../utils/db.js';
import crypto from 'crypto'
export default {
  findAll() {
    // return [
    //   { CatID: 1, CatName: 'Laptop' },
    //   { CatID: 2, CatName: 'Mobile' },
    //   { CatID: 3, CatName: 'Quần áo' },
    //   { CatID: 4, CatName: 'Giày dép' },
    //   { CatID: 5, CatName: 'Trang sức' },
    //   { CatID: 6, CatName: 'Khác' },
    // ];
    return db('public.categories');
  },
  findAllCourse() {
    return db('public.courses');
  },
  async getParent(){
    const sql = `select * from public."categories" ct where ct.parent_cat_id is null` 
    return db.raw(sql);
  },
  async getAmountCourse(cat_id){
    const sql = `select count(c."id") as amount_course
    from public."categories" ct join public.courses c on ct."cat_id" = c."cat_id"
    where ct."cat_id" = ${cat_id}
    group by ct."cat_id"`
    return db.raw(sql).then((result)=> {
      if(result.rows.length == 0)
          return 0
      return result.rows[0].amount_course
  });
  },
  async getAmountChild(cat_id){
    const sql = `select count(cat_id) as amount_children
    from public."categories" ct 
    where ct.parent_cat_id = ${cat_id}
    group by parent_cat_id` 
    return db.raw(sql).then((result)=> {
      if(result.rows.length == 0)
          return 0
      return result.rows[0].amount_children
  });
  },
  async findById(id) {
    const list = await db('public.categories').where('cat_id', id);
    if (list.length === 0) {
      return null;
    }
    return list[0];
  },
  async findbySlug(slug) {
    const list = await db('public.categories').where('slug', '/'+slug);
    
    if (list.length === 0) {
      return null;
    }

    return list[0];
  },
  findAllWithDetails(){
    const sql =`select c.*, cast(count(p."ProID") as INTEGER) as "ProductCount"
    from "public.categories" c left join "products" p on c."CatID" = p."CatID"
    group by c."CatID", c."CatName"`;
    return db.raw(sql);
  },

  add(entity) {
    console.log(crypto.randomInt(100000));
    const sql = `INSERT INTO public."categories" VALUES (${crypto.randomInt(100000)},'${entity.cat_name}','${entity.slug}',null,current_timestamp,current_timestamp)`
    return db.raw(sql).then((result)=>{
      console.log(result)
    }).catch((err)=>{
      console.log(err)
    });
  },

  del(id) {
    return db("categories").where('cat_id', id).del();
  },

  patch(entity) {
    // console.log(entity)
    const id = entity.cat_id;
    const sql = `update public."categories" Set "cat_name" = '${entity.cat_name}' where "cat_id"='${id}'`
    return db.raw(sql).then((result)=> {
      console.log(result)
    });
  },
  async getAllStudent(offset){
    const list = await db('users').where('role','STUDENT').limit(6).offset(offset*6);
    return list;
  },
  async getAllTeacher(offset){
    const list = await db('users').where('role','TEACHER').limit(6).offset(offset*6);
    return list;
  },
  async findStudentById(id) {
    const list = await db('users').where('id', id);
    if (list.length === 0) {
      return null;
    }
    return list[0];
  },
  async updateUser(entity){
    const id = entity.id;
    const sql = `update public."users" Set "is_verified" = '${entity.is_verified}' where "id"='${id}'`
    return db.raw(sql).then((result)=> {
      console.log(result)
    });
  },
  async checkExistSlug(slug){
    const sql = `select 1
    from public."categories" where slug = '${slug}'`
    return await db.raw(sql).then((result)=> {
      return result
    });
  },
  async generateSlug(cat_name){
    var newslug = '/'+convertToSlug(cat_name)
    let count = 0;
    while(await this.checkExistSlug(newslug).then((result)=> {
      var arr = result.rows
      var exist = arr.length != 0
      return exist
      })){
      newslug += count.toString()
      count +=1
    }
    return newslug
  }, 
   async findUserByEmail(email) {
    const users = await db('users').where('email', email);
    if (users.length === 0) return null;
    return users[0];
},
  async findCoursebyCate(cat_name){
    const sql = `select c.*
    from public."categories" ct join public.courses c on ct."cat_id" = c."cat_id"
    where ct."cat_name" = '${cat_name}'`
    const list  =  await db.raw(sql).then((result)=>{
      console.log(result)
      return result.rows
    })
     return list
  },
  async findCoursebyTeacher(fullname){
    const sql = `select c.*
    from public."users" u join public.courses c on c."teacher_id" = u."id"
    where u."fullname" = '${fullname}'`
    const list  =  await db.raw(sql).then((result)=>{
      console.log(result)
      return result.rows
    })
     return list
  },async findCoursebyTeacherandCate(cat_name,fullname){
    const sql = `select c.*
    from public."users" u join public.courses c on c."teacher_id" = u."id" join public.categories ct on ct."cat_id" = c."cat_id"
    where u."fullname" = '${fullname}' and ct."cat_name" = '${cat_name}'`
    const list  =  await db.raw(sql).then((result)=>{
      console.log(result)
      return result.rows
    })
     return list
  }
}
function convertToSlug(Text) {
  return Text.toLowerCase()
             .replace(/[^\w ]+/g, '')
             .replace(/ +/g, '-');
}