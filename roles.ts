import * as five from "johnny-five";


export default {
    devices: {
        cockpit: {
            name: "Cockpit",
            type: "rpz",
            io: [
                {
                    "name": "breakSensor",
                    "driver": five.Pin(''),
                }
            ]
        },
        engineroom: {
            name: "Cockpit",
            type: "rpz",
            io: [
                {
                    "name": "temperature",
                    "driver": five.Pin(''),
                }
            ]
        },
        masthead: {},
        cabinPort: {},
        cabinStarboard: {},
        cabinMain: {},
    }
}