import {engine} from "express-handlebars";
import {dirname, join} from "path";
import hbs_sections from 'express-handlebars-sections';
import {fileURLToPath} from "url";
import * as NumFormat from "../utils/numberFormat.js";

export default function (app) {
    const __dirname = dirname(fileURLToPath(import.meta.url));

    // Set view engine
    app.engine('hbs', engine({
        extname: ".hbs",
        defaultLayout: "main.hbs",
        helpers: {
            section: hbs_sections(),
            ...NumFormat,
            forLoop: function (from, to, incr, block) {
                var accum = '';
                for(var i = from; i < to; ++i) {
                    accum += block.fn(i);
                }
                return accum;
            },
            if_eq: function (value1, value2, block) {
                if (Number(value1) === Number(value2)){
                    return block.fn(this);
                }
                else
                    return block.inverse(this);
            },
            addNum: function (value1, value2, block) {
                return Number(value1) + Number(value2);
            },
            subNum: function (value1, value2, block) {
                return Number(value1) - Number(value2);
            },
            if_show: function (value1, block){
                if (Number(value1) != 0){
                    return block.fn(this);
                } else{
                    return block.inverse(this);
                }
            }
        }
    }));

    app.set('view engine', 'hbs');
    app.set('views', join(__dirname, '../views'));
}