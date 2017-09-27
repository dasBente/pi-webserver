#!/usr/bin/python3
import sys

# Import libraries concerning drawing on a OLED screen
from luma.core.interface.serial import i2c
from luma.core.render import canvas
from luma.oled.device import ssd1306

# Setup communication with the screen via I2C
serial = i2c(port=1, address=0x3C)
device = ssd1306(serial, rotate = 0)


# Parses commands for the OLED controller
#  All commands are words of the form cmd:par1,par2,...parN
def cmd_parse(command):
    command = command.split(":")
    return (command[0], command[1].split(","))


# Draw on the OLED according to the given command
def oled_draw(command, draw):
    name = command[0]
    params = command[1]

    if name == "line" or name == "l":
        line(params, draw)
    elif name == "rectangle" or name == "r":
        rectangle(params, draw)
    else:
        points(params, draw)

# Translate a given color number into a color
def get_color(color):
    if color == "0":
        color = "black"
    else:
        color = "white"

    return color
        
### Methods for rendering to the OLED ###

# Draw one or more points using a list of x and y coordinates and a color as
#  the lists first element
def points(args, draw):
    color = get_color(args.pop(0))
    draw.point([int(x) for x in args], fill = color)

# Draw a line using a list of x and y coordinates as
#  well as a color (1. list element) and a width (2. list element)
def line(args, draw):
    color = get_color(args.pop(0))
    w = int(args.pop(0))
    draw.line([int(x) for x in args], fill = color, width = w)

# Draw a rectangle using fill color, and two points for the bounding box
#  r:f,x1,y1,x2,y2
def rectangle(args, draw):
    color = get_color(args.pop(0))
    draw.rectangle([int(x) for x in args], fill = color, outline = "white") 
    
### Main function ###
    
def main():
    for line in sys.stdin:
        with canvas(device) as draw:
        #    draw.text((20,20), line, fill="white")
            for cmd in (cmd for cmd in line.split(" ") if cmd != ""):
                oled_draw(cmd_parse(cmd), draw)

# Run programm (if not imported for whatever reason)
if (__name__ == "__main__"):
    main()
