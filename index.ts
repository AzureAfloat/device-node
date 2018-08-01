import { WebSocketClient } from "./WebSocketClient";
import commandLineArgs from 'command-line-args';
import * as fileRelay from "./fileRelay";
import * as sensorReader from "./boardManager";
import fs from 'fs';

const WS = require('ws');

export const five = require('johnny-five');
export let board = new five.Board();
export let config = require('./device.json');

//override config with command line options  
let args = [
    { name: 'websocketUrl', alias: 'u', required: true },
    { name: 'deviceName', alias: 'd', required: true },
    { name: 'fileQueuePath', alias: 'q', required: true, defaultValue: './queue' }
];
config = { ...config, ...commandLineArgs(args) };
//throw errors if any required arguments are missing
args.filter(a => a.required && !config[a.name]).forEach(a => {
    throw new Error(`A ${a.name} argument must be provided either in a device.json file or as a command line argument (--${a.name} or -${a.alias}).`);
});

//ensure the file queue path exists
if (!fs.existsSync(config.fileQueuePath)) fs.mkdirSync(config.fileQueuePath);

//create websocket client
export let client = new WebSocketClient(config.websocketUrl);

//start reading sensor data right away
sensorReader.start();
client.on('open', () => fileRelay.start());
client.on('close', () => fileRelay.stop());

