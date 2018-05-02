//switch on config and load the module for the configured role (IOW, if this is the cockpit device, then import the cockpit module)

//send delta message with hard coded temperature
let delta = {
    "updates": [
        {
            "source": {
                "label": "RPZ Cockpit GPIO",
                "type": "GPIO",
                "src": "7"
            },
            "values": [
                {
                    "path": "environment.temperature",
                    "value": 68
                }
            ]
        }
    ]
};

const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:3001/signalk/v1/stream?subscribe=all');

ws.on('open', () => {
    console.log('sending');
    setInterval(() => ws.send(JSON.stringify(delta)), 1000);
});

// ws.on('message', data => console.log(data));