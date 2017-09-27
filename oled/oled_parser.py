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

    points(params, draw)

### Methods for rendering to the OLED ###

# Draw one or more points using triples (x, y, color)
def points(args, draw):
    while len(args) >= 3:
        x = int(args.pop(0))
        y = int(args.pop(0))
        color = args.pop(0)

        if color == 0:
            color="black"
        else:
            color="white"

        print("Point at ("+ str(x) +", "+ str(y) +")")
        draw.point([(x, y)], fill=color)

def main():
    for line in sys.stdin:
        with canvas(device) as draw:
        #    draw.text((20,20), line, fill="white")
            for cmd in (cmd for cmd in line.split(" ") if cmd != ""):
                oled_draw(cmd_parse(cmd), draw)

# Run programm (if not imported for whatever reason)
if (__name__ == "__main__"):
    main()
