const OLED_COLS = 128;
const OLED_ROWS = 64;

// Contains information about current state of the screen
var screen = initBuffer(OLED_COLS, OLED_ROWS, 0); // TODO: Replace through server side initialization via ws

$(function() {
    // Attach canvas controller to the canvas
    var contr = CanvasController($('canvas'), OLED_COLS, OLED_ROWS);

    var url = "ws:"+ window.location.href.split(':')[1] +":8090/oled"
    var cli = CanvasClient(url);

    // Initialize Event handlers
    contr.initEventHandler(cli);
    cli.initEventHandler(contr);
});

/* Creates a canvas controller which initializes and manages the canvas */
function CanvasController(canvas, cols, rows) {
    var context = canvas.get(0).getContext("2d");

    // Contains information about last action performed
    var buffer = initBuffer(cols, rows, -1);
    
    // Canvas dimensions
    var width = context.canvas.clientWidth, height = context.canvas.clientHeight;
    var cellWidth = width / cols, cellHeight = height / rows;

    // Write val to the buffer depending on mouse position 
    var screenToBuffer = function(x, y, val) {
	x = Math.floor(x / cellWidth);
	y = Math.floor(y / cellHeight);

	if (x >= 0 && x < cols && y >= 0 && y < rows) {
	    buffer[x][y] = val;
	}
    }
    
    return {
	/* Render the entire oled buffer to the canvas */
	renderBuffer: function (buf = screen) {
	    var prevCol = context.fillStyle;
	    
	    cellwise(buf, function (x,y) {
		if (buf[x][y] == 0) { 
		    context.fillStyle = "#000";
		    context.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight)
		} else if (buf[x][y] == 1) {
		    context.fillStyle = "#fff";
		    context.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight)
		}
	    });
	    
	    context.fillStyle = prevCol;
	},

	/* Render a grid over the canvas*/
	grid: function (color) {
	    context.translate(0.5, 0.5);
	    
	    var prevCol = context.strokeStyle;
	    context.strokeStyle = color;
    
	    // Vertical
	    for (x = 1; x < cols; x++) {
		context.moveTo(x * cellWidth, 0);
		context.lineTo(x * cellWidth, height);
		context.stroke();
	    }
	    
	    // Horizontal
	    for (y = 1; y < rows; y++) {
		context.moveTo(0, y * cellHeight);
		context.lineTo(width, y * cellHeight);
		context.stroke();
	    }

	    // Restore previous context
	    context.strokeStyle = prevCol;
	    context.translate(0, 0);
	},

	/* Initialize the canvas's event handling */
	initEventHandler: function (client) {
	    // Current Mouse mode; 0 => released, 1 => held down
	    var mouseDown = false;
	    var controller = this;
	    
	    // Eventhandling
	    canvas.on('mousedown', function () {
		mouseDown = true;
	    });

	    canvas.on('mousemove', function (e) {
		if (mouseDown) {
		    screenToBuffer(e.offsetX, e.offsetY, 1);
		    controller.renderBuffer(buffer);
		}
	    });
	    
	    $(window).on('mouseup', function (e) {
		mouseDown = false;
		controller.renderBuffer(); // TODO: Remove later!
		client.sendBuffer(buffer, 1);
	    });
	}
    }
}

/* Creates a Websocket client to communicate with a server */
function CanvasClient(url) {
    var ws = new WebSocket(url);

    /* Send empty message to server to get update */
    var update = function () {
	ws.send(JSON.stringify({
	    on: [],
	    off: []
	}));
    }
    
    return {
	
	/* Process a canvas buffer and send it to the server*/
	sendBuffer: function (buffer) {
	    var on = [], off = [];

	    cellwise(buffer, function (x, y) {
		if (buffer[x][y] == 0) {
		    off.push([x,y]);
		} else if (buffer[x][y] == 1)  {
		    on.push([x,y]);
		}

		// Delete buffer again
		buffer[x][y] = -1;
	    });

	    if (on.length + off.length > 0) {
		var msg = {
		    on: on,
		    off: off
		};
		
		ws.send(JSON.stringify(msg));
	    }
	},

	/* Initialize the web sockets event handling */
	initEventHandler: function (controller) {
	    ws.onmessage = function (e) {
		var msg = JSON.parse(e.data);

		screen = msg.screen;
		controller.renderBuffer();
	    }

	    ws.onopen = function (e) {
		update();
	    }
	}
    }
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

/* Helperfunction to iterate over buffer */
function cellwise(arr, lambda) {
    for (x = 0; x < arr.length; x++) {
	for (y = 0; y < arr[x].length; y++) {
	    lambda(x,y);
	}
    }
};
