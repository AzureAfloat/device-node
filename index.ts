const five = require("johnny-five");
const Raspi = require('raspi-io');
const WebSocket = require('ws');
const config = require('./device.json');

//setup websockets
const ws = new WebSocket(config.webocketUrl);

//setup j5
let board = new five.Board({ io: new Raspi() });

//ready the board and the websocket connection
board.on("ready", () => {
    ws.on('open', () => {

        //just send hard coded messages every second
        setInterval(() => sendDeltaMessage(config.deviceName, "environment.temperature", 68), 1000);
        setInterval(() => sendDeltaMessage(config.deviceName, "environment.humidity", 40), 1200);
    });
});

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