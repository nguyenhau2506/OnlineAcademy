import {dirname, join} from "path";
import {fileURLToPath} from "url";
import logger from "morgan";
import express from "express";
import cookieParser from "cookie-parser";

export default function (app) {
    const __dirname = dirname(fileURLToPath(import.meta.url));

    app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use('/public', express.static(join(__dirname, '../../public')));
}