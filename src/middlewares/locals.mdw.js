import {getAvatarWithUrl} from "../utils/helpers.js";
import categoriesService from "../services/categories.service.js";

const categoriesMdw = async (req, res, next) => {
  // if (!req.locals.partials) req.locals.partials = {};
  const loadData = () =>
    Promise.resolve([
      {
        title: "IT",
        path: "/IT",
        children: [
          {
            title: "Web development",
            path: "/IT/web-development",
            children: []
          },
          {
            title: "Mobile development",
            path: "/IT/mobile-development",
            children: []
          }
        ]
      },
      {
        title: "Design",
        path: "/design",
        children: [
          {
            title: "Web design",
            path: "/design/web-design",
            children: []
          },
          {
            title: "Logo design",
            path: "/design/logo-design",
            children: []
          }
        ]
      },
      {
        title: "Marketing",
        path: "/marketing",
        children: [
          {
            title: "Digital marketing",
            path: "/marketing/digital-marketing",
            children: []
          },
          {
            title: "Content marketing",
            path: "/marketing/content-marketing",
            children: []
          }
        ]
      },
      {
        title: "Music",
        path: "/music",
        children: [
          {
            title: "Instruments",
            path: "/music/instruments",
            children: []
          },
          {
            title: "Vocal",
            path: "/music/vocal",
            children: []
          }
        ]
      },
    ]);
  res.locals.categories = await categoriesService.getAllCategories();
  next();
};

const loggedUser = async (req, res, next) => {
    // console.log(req.user);
    if (req.session.auth) {
        res.locals.auth = req.session.auth;
        res.locals.authUser = req.user;
    }
    next();
};

export default function (app) {
    app.use(loggedUser);
    app.use(categoriesMdw);
}
