const express = require('express');
const app = express();
const port = 8000;

// Set Pug as view engine (Template location defaults to ./views)
app.set('view engine', 'pug');

app.get('/', function (req, res) {
    res.render('home', {
	title: 'Hello, World!'
    });
});

app.listen(port, function () {
    console.log('Example app listening on port '+ port +'!');
});
