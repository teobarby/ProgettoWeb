var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sqlite3 = require('sqlite3').verbose();
var app = express();


const indexRouter = require('./routes/index');
const accessoRouter = require('./routes/accesso');
const iscrizioneRouter = require('./routes/iscrizione');
const ristoranteRouter = require('./routes/paginaRistorante');
const profiloRouter = require('./routes/profilo');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Connessione al database SQLite
const db = new sqlite3.Database('/Users/matteobarbieri/Documents/Uni/ProgettoWeb/database/GustoInRete.db', (err) => {
    if (err) {
        console.error('Errore nella connessione al database:', err.message);
    } else {
        console.log('Connessione al database avvenuta con successo.');
    }
});

// Passa il db alle route
app.use((req, res, next) => {
    req.db = db;
    next();
});

app.use('/', indexRouter);
app.use('/accesso', accessoRouter);
app.use('/iscrizione', iscrizioneRouter);
app.use('/paginaRistorante', ristoranteRouter);
app.use('/profilo', profiloRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

// Chiudi la connessione al database quando il server viene arrestato
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Errore nella chiusura del database:', err.message);
        } else {
            console.log('Connessione al database chiusa.');
        }
        process.exit(0);
    });
});

// Avvia il server
app.listen(3000, () => {
    console.log('Server avviato su http://localhost:${3000}');
});