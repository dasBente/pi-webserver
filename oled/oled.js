const WebSocket = require('ws');

var screen = initBuffer(128, 64, 0);

module.exports = function (httpServer) {
    const wss = new WebSocket.Server({
	//	server: httpServer
	port: 8090,
	clientTracking: true
    });

    wss.broadcast = function (data) {
	wss.clients.forEach(function (client) {
	    if (client.readyState === WebSocket.OPEN) {
		client.send(data);
	    }
	});
    }
    
    wss.on('connection', function (ws) {
	ws.on('message', function (data) {
	    var msg = JSON.parse(data);

	    // Update screen state
	    var f = function (val, coords) {
		screen[coords[0]][coords[1]] = val;
	    }

	    msg.on.forEach((xy) => f(1, xy));
	    msg.off.forEach((xy) => f(0, xy));

	    wss.broadcast(JSON.stringify({
		screen: screen
	    }));
	    
	    // Send data to oled_parser
	    var cmd = toCommand(msg);
	    
	    console.log(cmd);
	});
    });
}

/* Generate a command for oled_parser from a message */
function toCommand(msg) {
    var res = [];

    var on = [].concat.apply([], msg.on);
    var off = [].concat.apply([], msg.off);
    
    if (msg.on.length > 0) {
	res.push(":1,"+ on.join());
    }
    
    if (msg.off.length > 0) {
	res.push(":0,"+ off.join());
    }
    
    return res.join(" ");
}

/* Creates a new buffer filled with entries of value */
function initBuffer(cols, rows, value) {
    arr = Array(cols);
    
    for (x = 0; x < cols; x++) {
	var col = Array(rows);

	for (y = 0; y < rows; y++) {
	    col[y] = value;
	}
	
	arr[x] = col;
    }

    return arr;
}

