#!/usr/bin/python3
import sys

# Import libraries concerning drawing on a OLED screen
from luma.core.interface.serial import i2c
from luma.core.render import canvas
from luma.oled.device import ssd1306

# Setup communication with the screen via I2C
serial = i2c(port=1, address=0x3C)
device = ssd1306(serial, rotate = 0)

def main():
    for line in sys.stdin:
        cmds = map(cmd_parse, line.split(' '))
        map(oled_draw, cmds)

# Run programm (if not imported for whatever reason)
if (__name__ == "__main__"):
    main()

# Parses commands for the OLED controller
#  All commands are words of the form cmd:par1,par2,...parN
def cmd_parse(command):
    command = command.split(":")
    return (command[0], command[1].split(","))

draw = canvas(device) 

# Draw on the OLED according to the given command
def oled_draw(command):
    name = command[0]
    params = command[1]

    #with canvas(device) as draw:
    # Draw depending on the given command 

    # default case: draw points
    points(params)

### Methods for rendering to the OLED ###

# Draw one or more points using triples (x, y, color)
def points(args):
    while len(args) >= 3:
        x = args.pop(0)
        y = args.pop(0)
        color = args.pop(0)

        if color == 0:
            color="black"
        else:
            color="white"

        draw.point(x, y, fill=color)
    
