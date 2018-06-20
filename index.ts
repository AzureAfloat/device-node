const WS = require('ws');
const fs = require('fs');
let config = require('./device.json');
const commandLineArgs = require('command-line-args')
const stream = require('stream');
//override config with command line options  
let args = [
    { name: 'websocketUrl', alias: 'u', required: true },
    { name: 'deviceName', alias: 'd', required: true }
];
config = { ...config, ...commandLineArgs(args) };

//throw errors if any required arguments are missing
args.filter(a => a.required && !config[a.name]).forEach(a => {
    throw new Error(`A ${a.name} argument must be provided either in a device.json file or as a command line argument (--${a.name} or -${a.alias}).`);
})

//wrapper function for our websocket
function WebSocketClient() {
    this.autoReconnectInterval = 5000;	// ms
}
WebSocketClient.prototype.open = function (url) {
    this.url = url;
    this.instance = new WS(this.url);
    this.instance.on('open', () => {
        this.onopen();
    });
    this.instance.on('error', (e) => {
        switch (e.code) {
            case 'ECONNREFUSED':
                this.reconnect(e);
                break;
            default:
                this.reconnect(e);
                this.onerror(e);
                break;
        }
    });
    this.instance.on('close', (e) => {
        switch (e.code) {
            case 1000:	// CLOSE_NORMAL
                console.log("WebSocket: closed");
                break;
            default:	// Abnormal closure
                this.reconnect(e);
                break;
        }
        this.onclose(e);
    });
}
WebSocketClient.prototype.send = function (data) {
    try {
        this.instance.send(data);
    } catch (e) {
        this.instance.emit('error', e);
    }
}
WebSocketClient.prototype.reconnect = function (e) {
    console.log(`WebSocketClient: retry in ${this.autoReconnectInterval}ms`, e);
    this.instance.removeAllListeners();
    var that = this;
    setTimeout(function () {
        console.log("WebSocketClient: reconnecting...");
        that.open(that.url);
    }, this.autoReconnectInterval);
}
WebSocketClient.prototype.onerror = () => console.log("WebSocketClient: error", arguments);

var ws = new WebSocketClient();
ws.open(config.websocketUrl);
ws.onopen = () => {
    switch (config.deviceName) {
        case "rpz-cockpit":
            mockSensor("environment/outside/temperature", 68, 5, 3000);
            mockSensor("environment/outside/humidity", 40, 3, 3000);
            break;
        case "rpz-masthead":
            mockSensor("environment/wind/speedApparent", 12, 5, 1000);
            mockSensor("environment/outside/temperature", 55, 1, 3000);
            mockSensor("environment/wind/directionTrue", 180, 45, 250);
            mockSensor("environment/outside/humidity", 40, 3, 3000);
            break;
        case "rpz-engine":
            mockSensor("environment/inside/temperature", 40, 3, 3000);
            mockSensor("propulsion/mainEngine/coolantTemperature", 88, 1, 3000);
            mockSensor("propulsion/mainEngine/intakeManifoldTemperature", 120, 1, 3000);

            break;
        case "rpz-aftstar":
            mockSensor("environment/inside/temperature", 68, 5, 3000);
            mockSensor("environment/inside/humidity", 40, 3, 3000);
            break;
        case "rpz-aftport":
            mockSensor("environment/inside/temperature", 68, 5, 3000);
            mockSensor("environment/inside/humidity", 40, 3, 3000);
            break;
        case "rpz-master":
            mockSensor("environment/inside/temperature", 68, 5, 3000);
            mockSensor("environment/inside/humidity", 40, 3, 3000);
            break;
        case "rpz-cabin":
            mockSensor("environment/inside/temperature", 68, 5, 3000);
            mockSensor("environment/inside/humidity", 40, 3, 3000);
            mockSensor("electrical/batteries/starter/voltage", 13.3, 0.2, 3000);
            mockSensor("electrical/batteries/house/voltage", 13.1, 0.1, 3000);
            mockSensor("electrical/batteries/starter/current", 0, 0.1, 3000);
            mockSensor("electrical/batteries/house/current", 1.4, 0.3, 3000);
            mockSensor("electrical/batteries/starter/temperature", 67, 0, 3000);
            mockSensor("electrical/batteries/house/temperature", 67, 0, 3000);
            break;
        default:
            console.log(`A device with the name ${config.deviceName} was not found.`);
    }
};

//make it easy to create mock datapoints and send them as delta messages
function mockSensor(datapoint: string, median: number, variance: number, frequency: number) {
    let value;
    setInterval(() => {
        value = (median - variance) + Math.round(Math.random() * variance);
        console.log(`Sending ${value} for ${datapoint}`);
        sendDeltaMessage(config.deviceName, datapoint, value)
    }, frequency)
}

function sendDeltaMessage(deviceName: string, path: string, value: any) {
    let delta = {
        "updates": [
            {
                "source": {
                    "deviceName": deviceName
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
    if (ws.readyState == 0 && ws.readyState == 1)
        ws.send(JSON.stringify(delta));
};
ws.onclose = () => console.log("Websocket is closed reconnecting...")
