import session from 'express-session';
import fnKnexSessionStore from 'connect-session-knex';
import db from '../utils/db.js';

export default function (app) {
    const KnexSessionStore = fnKnexSessionStore(session);
    const store = new KnexSessionStore({
        knex: db
    });

    app.use(session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: true,
        store
    }))
}
