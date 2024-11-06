const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sqlite3 = require('sqlite3').verbose();
const sqliteStoreFactory = require('express-session-sqlite');
const app = express();
const config = require('./config.json');
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const iscrizioneRouter = require('./routes/iscrizione');
const ristoranteRouter = require('./routes/paginaRistorante');
const profiloRouter = require('./routes/profilo');
const cronoRouter = require('./routes/crono');
const chiSiamoRouter = require('./routes/chiSiamo');
const privacyPolicyRouter = require('./routes/privacyPolicy');
const terminiRouter = require('./routes/termini');
const cronoRistRouter = require('./routes/cronoRist');
const risposteRouter = require('./routes/risposteRist');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const DataBase = require("./db"); 
const db = new DataBase();
const session = require('express-session');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// view engine setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
const SqliteStore = sqliteStoreFactory.default(session)
app.use(session({
    secret: config.secret,
    resave: true,       
    saveUninitialized: false,
    cookie: { path: '/',
        httpOnly: true, maxAge: 1209600000},
    store: new SqliteStore({driver: sqlite3.Database,
        path: 'database/sqliteSessions.db',
        ttl: 1209600000,
        prefix: 'sess:',
        cleanupInterval: 300000
      }),
    }
));
app.use(passport.session());

// Login passport
passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
}, async function (username, password, done) {
    try {
        const user = await db.trovaUtenteUsername(username);

        if (!user) {
            console.log("Utente non trovato:", username);
            return done(null, false, { message: 'Username o password errati' });
        }

        bcrypt.compare(password, user.password, function (err, result) {
            if (err) {
                console.error("Errore durante il confronto delle password:", err);
                return done(err);
            }

            if (result) {
                console.log("Login riuscito per utente:", username);
                return done(null, user);
            } else {
                console.log("Password errata per utente:", username);
                return done(null, false, { message: 'Username o password errati' });
            }
        });
    } catch (err) {
        console.error("Errore nel trovare l'utente:", err);
        return done(err);
    }
}));

// Serialize and Deserialize
passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
        cb(null, { id: user.id, username: user.username });
    });
});

passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
        return cb(null, user);
    });
});

// Cache control
app.use((req, res, next) => {
res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
res.set('Pragma', 'no-cache');
res.set('Expires', '-1');
next();
});


// Rotte
app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/', iscrizioneRouter);
app.use('/', ristoranteRouter);
app.use('/', profiloRouter);
app.use('/', cronoRouter);
app.use('/', chiSiamoRouter);
app.use('/', privacyPolicyRouter);
app.use('/', terminiRouter);
app.use('/', cronoRistRouter);
app.use('/', risposteRouter);


// Errore
app.use(function(req, res, next) {
    res.status(404).render('error', {
        title: 'Errore',
        message: 'C\'è stato un errore durante il caricamento della pagina',
        username: req.session ? req.session.username : null
      });
});

// Server avviato
app.listen(3000, () => {
    console.log('Server avviato su http://localhost:3000');
});