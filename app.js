/**
 * This programm sets up anything around representation and navigation of this webserver. Essentially this 
 *  servers backbone.
 */

// The app will make use of express for all it's page-related functionallity
const express = require('express');
const app = express();

const path = require('path');

const routes = require('./routes');

// Set Pug as view engine 
app.set('view engine', 'pug');

app.set('views', path.join(__dirname, 'views'));

// Register node modules and public files with the express server
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.use(express.static(path.join(__dirname, 'public')));

// Setup REST routing
app.get('/helloworld', function (req, res) {
    res.render('home', {
	title: 'Hello, World!'
    });
});

app.get('/oled', function (req, res) {
    res.render('oled/oled', {});
});

// Forward any caught 404s to the error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Error handling
app.use(function (err, req, res, next) {
    res.status(err.status || 500);

    res.render('error', {
	message: err.message,
	error: app.get('env') === 'development' ? err : {}
    });
});

module.exports = app;
