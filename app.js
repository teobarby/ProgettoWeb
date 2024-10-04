var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sqlite3 = require('sqlite3').verbose();
var app = express();

const config = require('./config.json');
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const iscrizioneRouter = require('./routes/iscrizione');
const ristoranteRouter = require('./routes/paginaRistorante');
const profiloRouter = require('./routes/profilo');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
// const db = require('./db');
const DataBase = require("./db"); // db.js
const db = new DataBase();
const session = require('express-session');
var SQLiteStore = require('connect-sqlite3')(session);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: config.secret,
    resave: true,
    saveUninitialized: false
}));


app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/', iscrizioneRouter);
app.use('/', ristoranteRouter);
app.use('/', profiloRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// Avvia il server
app.listen(3000, () => {
    console.log('Server avviato su http://localhost:${3000}');
});