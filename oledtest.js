var opts = {
    width: 128,
    height: 64,
    address: 0x3d
}

var oled = new require('oled-js-pi')(opts);

oled.clearDisplay();

for (i = 0; i < 10; i++) {
    oled.drawLine(1, 1, 1 + 10 * i, 32, 1);
}
