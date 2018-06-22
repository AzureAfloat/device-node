import { WebSocketClient } from "./WebSocketClient";

// const WS = require('ws');
let config = require('./device.json');
const commandLineArgs = require('command-line-args')

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

// const ws = new WS(config.websocketUrl);
let client = new WebSocketClient(config.websocketUrl);

client.on('open', () => {
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
});

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
        client.send(JSON.stringify(delta));
};

 