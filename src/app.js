import express from 'express';
import dotenv from 'dotenv';
import { resetDatabase } from './utils/db.js'
import routesMdw from "./middlewares/routes.mdw.js";
import sessionMdw from "./middlewares/session.mdw.js";
import defaultMdw from "./middlewares/default.mdw.js";
import viewMdw from "./middlewares/view.mdw.js";
import authMdw from "./middlewares/auth.mdw.js";
import localsMdw from "./middlewares/locals.mdw.js";
import MailSender from "./utils/mail_sender.js"
dotenv.config();
const app = express();
// resetDatabase();
viewMdw(app);
defaultMdw(app);
sessionMdw(app);
authMdw(app);
localsMdw(app);
routesMdw(app);

// dqvinh20@clc.fitus.edu.vn
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Server is listening at " + port);
})