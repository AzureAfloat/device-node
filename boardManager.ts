import { config } from "./index";
import sleep from 'moment';
import path from 'path';
import fs from 'fs';
import { startSmartCabinDoor } from "./startSmartCabinDoor";
import { board, five } from './index';
const PiCamera = require('pi-camera');

//const raspio = require('raspi-io');

board.on("ready", function boardOnReady() { });
//start reading sensors
export function start() {
    switch (config.deviceName) {
        case "rpz-cockpit":
            board.boardOnReady();
            let imagebutton = new five.Button(8);
            imagebutton.on('press', () => {
                const rpzCockpitCamera = new PiCamera({
                    mode: 'photo',
                    output: `${__dirname}/test.jpg`,
                    width: 640,
                    height: 480,
                    nopreview: true,
                });
                rpzCockpitCamera.snap()
                    .then((result) => {
                        console.log('Picture taken' + result);
                    })
                    .catch((error) => {
                        console.log('There was an error' + error);
                    });
            });
            imagebutton.on('release', () => {
                startSmartCabinDoor();

            })
            // mockSensor("environment/outside/temperature", 68, 5, 3000);
            // mockSensor("environment/outside/humidity", 40, 3, 3000);
            break;
        // case "rpz-masthead":
        //     mockSensor("environment/wind/speedApparent", 12, 5, 1000);
        //     mockSensor("environment/outside/temperature", 55, 1, 3000);
        //     mockSensor("environment/wind/directionTrue", 180, 45, 250);
        //     mockSensor("environment/outside/humidity", 40, 3, 3000);
        //     break;
        // case "rpz-engine":
        //     mockSensor("environment/inside/temperature", 40, 3, 3000);
        //     mockSensor("propulsion/mainEngine/coolantTemperature", 88, 1, 3000);
        //     mockSensor("propulsion/mainEngine/intakeManifoldTemperature", 120, 1, 3000);

        //     break;
        // case "rpz-aftstar":
        //     mockSensor("environment/inside/temperature", 68, 5, 3000);
        //     mockSensor("environment/inside/humidity", 40, 3, 3000);
        //     break;
        // case "rpz-aftport":
        //     mockSensor("environment/inside/temperature", 68, 5, 3000);
        //     mockSensor("environment/inside/humidity", 40, 3, 3000);
        //     break;
        // case "rpz-master":
        //     mockSensor("environment/inside/temperature", 68, 5, 3000);
        //     mockSensor("environment/inside/humidity", 40, 3, 3000);
        //     break;
        // case "rpz-cabin":
        //     mockSensor("environment/inside/temperature", 68, 5, 3000);
        //     mockSensor("environment/inside/humidity", 40, 3, 3000);
        //     mockSensor("electrical/batteries/starter/voltage", 13.3, 0.2, 3000);
        //     mockSensor("electrical/batteries/house/voltage", 13.1, 0.1, 3000);
        //     mockSensor("electrical/batteries/starter/current", 0, 0.1, 3000);
        //     mockSensor("electrical/batteries/house/current", 1.4, 0.3, 3000);
        //     mockSensor("electrical/batteries/starter/temperature", 67, 0, 3000);
        //     mockSensor("electrical/batteries/house/temperature", 67, 0, 3000);
        //     break;
        default:
            console.log(`A device with the name ${config.deviceName} was not found.`);
    }
}

//make it easy to create mock datapoints and send them as delta messages
// function mockSensor(datapoint: string, median: number, variance: number, frequency: number) {
//     let value;
//     setInterval(() => {
//         value = (median - variance) + Math.round(Math.random() * variance);
//         let timestamp = moment().utc().format('YYYY-MM-DDTHHmmss.SSSS[Z]');
//         datapoint = datapoint.replace(/\//g, '_');
//         let filename = `${timestamp}_${datapoint}`;
//         console.log(`creating ${filename}`);

//         let fullpath = path.join(config.fileQueuePath, filename);
//         fs.writeFileSync(fullpath, value, 'utf8');
//     }, frequency);

// }
