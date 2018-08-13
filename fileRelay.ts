import { client, config } from "./index";
import { watch, readFile, FSWatcher, unlink, readdir } from "fs";
import { join } from "path";

let watcher;
const pattern = /.*Z_(.*)/;

// start watching files in the directory, send, and delete
export function start() {

    //process existing files
    readdir(config.fileQueuePath, (err, files) => {
        files
            .filter(f => pattern.test(f))
            .forEach(f => sendFile(f))
    });

    //watch for new files
    watcher = watch(config.fileQueuePath, { encoding: "utf8" }, (eventType, file) => {
        if(eventType == 'rename' && pattern.test(file)) sendFile(file);
    });
}

export function stop() {
    if(watcher) watcher.close();
}

function sendFile(file) {
    console.log('sending ' + file);
    let filePath = join(config.fileQueuePath,file);
    readFile(filePath, (err, data) => {
        let datapointName = pattern.exec(file);

        //send the file contents
        if(data) sendDeltaMessage(config.deviceName, (datapointName ? datapointName[1] : ''), data.toString());
        
        //delete the file
        unlink(filePath, err => {});
    })
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