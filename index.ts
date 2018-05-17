// const five = require("johnny-five");
// const Raspi = require('raspi-io');
let WebSocket = require('ws');
const config = require('./device.json');
const argv = require('yargs').argv

//setup websockets
const ws = new WebSocket(config.websocketUrl);

//setup j5
// let board = new five.Board({ io: new Raspi() });
//ready the board and the websocket connection
// board.on("ready", () => {
    ws.onopen = () => {
        //just send hard coded messages every second
        setInterval(() => sendDeltaMessage(config.deviceName, "environment.temperature", 68), 1000);
        setInterval(() => sendDeltaMessage(config.deviceName, "environment.humidity", 40), 1200);
    };
// });

function sendDeltaMessage(deviceId: string, path: string, value: any) {
    let delta = {
        "updates": [
            {
                "source": {
                    "label": deviceId,
                    "type": "GPIO",
                    "src": "7"
                },
                "values": [
                    {
                        "path": path,
                        "value": value
                    }
                ]
            }
        ]
    };
    ws.send(JSON.stringify(delta));
}