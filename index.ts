let config = require('./device.json');
const commandLineArgs = require('command-line-args')

//override config with command line options  
let args = [
    { name: 'websocketUrl', alias: 'u', required: true },
    { name: 'deviceName', alias: 'd', required: true },
    { name: 'friendlyName', alias: 'n', required: true }
];
config = { ...config, ...commandLineArgs(args) };

//throw errors if any required arguments are missing
args.filter(a => a.required && !config[a.name]).forEach(a => {
    throw new Error(`A ${a.name} argument must be provided either in a device.json file or as a command line argument.`);
})

//setup websockets
const ws = new WebSocket(config.websocketUrl);

ws.onopen = () => {
    //send mock datapoints
    mockSensor("environment.temperature",68,5,3000);
    mockSensor("environment.humidity",40,3,3000);
};

//make it easy to create mock datapoints and send them as delta messages
function mockSensor(datapoint:string, median: number, variance: number, frequency: number) {
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
                    "src": deviceName
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