let Raspi = require('raspi-io');
let five = require("johnny-five");
let board = new five.Board({ io: new Raspi() });

board.on("ready", () => {

    //enumerate io (using roles.ts)


});