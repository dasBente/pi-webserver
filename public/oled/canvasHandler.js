const OLED_COLS = 128;
const OLED_ROWS = 64;

$(function() {
    // Attach canvas controller to the canvas
    var cc = CanvasController($('canvas'), OLED_COLS, OLED_ROWS);
    cc.initEventhandler();
    
    cc.renderBuffer();
});

// Creates a canvas controller which initializes and manages the canvas
function CanvasController(canvas, cols, rows) {
    var context = canvas.get(0).getContext("2d");

    // Contains information about last action performed
    var buffer = initBuffer(cols, rows);

    // Contains information about current state of the screen
    var screen = initBuffer(cols, rows);
    
    // Canvas dimensions
    var width = context.canvas.clientWidth, height = context.canvas.clientHeight;
    var cellWidth = width / cols, cellHeight = height / rows;
    
    /* Helperfunction to iterate over buffer */
    var cellwise = function (lambda) {
	for (x = 0; x < cols; x++) {
	    for (y = 0; y < rows; y++) {
		lambda(x,y);
	    }
	}
    };

    // Write val to the buffer depending on mouse position 
    var screenToBuffer = function(x, y, val) {
	x = Math.floor(x / cellWidth);
	y = Math.floor(y / cellHeight);

	console.log("Wrote %i to (%i, %i)", val, x, y);
	
	buffer[x][y] = val;
    }
    
    return {
	/* Render the entire oled buffer to the canvas */
	renderBuffer: function (buf = screen) {
	    context.clearRect(0, 0, width, height);

	    var prevCol = context.fillStyle;
	    context.fillStyle = "#000";

	    cellwise(function (x,y) {
		if (buf[x][y] == 0) {
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
	initEventhandler: function () {
	    // Current Mouse mode; 0 => released, 1 => held down
	    var mouseDown = false;
	    var obj = this;
	    // Eventhandling
	    canvas.on('mousedown', function () {
		mouseDown = true;
	    });

	    canvas.on('mousemove', function (e) {
		if (mouseDown) {
		    screenToBuffer(e.offsetX, e.offsetY, 1);
		}
	    });
	    
	    $(window).on('mouseup', function (e) {
		mouseDown = false;
		obj.renderBuffer();
	    });
	}
    }
}

/* Creates a new buffer filled with zeroes */
function initBuffer(cols, rows) {
    arr = Array(cols);
    
    for (x = 0; x < OLED_COLS; x++) {
	var col = Array(OLED_ROWS);

	for (y = 0; y < OLED_ROWS; y++) {
	    col[y] = 0;
	}
	
	arr[x] = col;
    }

    return arr;
}
