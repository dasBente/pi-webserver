/**
 * This programm concerns itself with starting up and controlling all aspects and services of the webserver.
 */

// We need a http server for any non-express functionallity
const http = require('http');
const app = require('./app');

// Retrieve a port from environment to be used by this server
const port = normalizePort(process.env.PORT || '8080');
app.set('port', port);

// Start HTTP server and begin listening to it
const server = http.createServer(app);
server.listen(port);

// HTTP server events
server.on('listening', function () {
    console.log('Listening on port '+ server.address().port);
});

server.on('error', function (err) {
    if (error.syscall !== 'listen') {
	throw err;
    }

    // Determine the type of the port used by our HTTP server
    let bind = typeof port === 'string' ? 'Pipe '+ port : 'Port '+ port;

    switch (error.code) {
    case 'EACCES':
	console.error(bind + ' requires elevated privileges');
	process.exit(1);
	break;

    case 'EADDRINUSE':
	console.error(bind + ' is already in use');
	process.exit(1);
	break;

    default:
	throw err;
    }
});

/* Helper function to retrieve the port from a string delivered by the environment */
function normalizePort(val) {
    let port = parseInt(val, 10);

    if (isNaN(port)) { // The port is a named pipe
	return val;
    } else if (port >= 0) { // The port is a port number
	return port;
    } else {
	return false;
    }
}
