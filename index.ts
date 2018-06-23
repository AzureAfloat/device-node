const WS = require('ws');

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

//setup websockets
//const ws = new WS(config.websocketUrl);

//ws.onopen = () => {
    switch (config.deviceName) {
        case "rpz-cockpit":
            mockSensor("environment/outside/temperature", 68, 5, 3000);
            mockSensor("environment/outside/humidity", 40, 3, 3000);

            //Smart Cabin Door
            //Create credentials
            const CognitiveServicesCredentials = require('ms-rest-azure').CognitiveServicesCredentials;
            let credentials = new CognitiveServicesCredentials("31fa991dd9824dacacfce77c70ed1892");
            const FaceAPIClient = require('azure-cognitiveservices-face');
            const fs = require('fs');

            let client = new FaceAPIClient(credentials, 'westus');

            //Create new PersonGroup
            function makePersonGroup(pGroupId) //pGroupId is a string with NO CAPITAL LETTERS
            {
                client.personGroup.create(pGroupId,{
                    name: pGroupId
                });
                console.log("Just created this PersonGroup: ", pGroupId);
            }

            var testGroupId = 'testgroup2';
            makePersonGroup(testGroupId);

            //Create a Person in specified PersonGroup
            var personData;
            var testPersonId;

            function makePersonInGroup(pGroupId, personName)
            {
                client.person.create(pGroupId,{ 
                    personGroupId: pGroupId,
                    name: personName
                }).then(httpResponse => {
                    personData = JSON.parse(httpResponse.response.body)
                    console.log(personData);
                    //testPersonId = personData[0].personId;
                    //console.log(personData);
                    //console.log("This person's PersonId is: ", testPersonId);
                });
                console.log("Just created the Person ", personName, " in the PersonGroup ", pGroupId);
            }

            var testPersonName = 'testpersonname';
            makePersonInGroup(testGroupId, testPersonName);

            // let bUrie = client.person.create("personGroup1", "brendonUrie" //personGroupId, person's name
            // ).then(httpResponse => console.log(httpResponse.response.body)
            // ).catch(err => { throw err; }); 

            //Add Face to a Person
            var addFaceData;

            function addFaceToPerson(pGroupId, pId, imagePath)
            {
                client.person.addPersonFaceFromStreamWithHttpOperationResponse(pGroupId, pId, imagePath, {
                    personGroupId: pGroupId,
                    personId: pId
                }).then(httpResponse => {
                    addFaceData = JSON.parse(httpResponse.response.body)
                    console.log(addFaceData);
                    testPersonId = addFaceData.personId;
                    console.log("This person's PersonId is: ", testPersonId)
                })
                console.log("Just added face from photo ", imagePath, " to the Person ", 
                    pId, " in the PersonGroup ", pGroupId);
            }

            addFaceToPerson(testGroupId, testPersonId, 'faces/brendon1.jpg');

                //Detect face, then parse JSON response to get faceID
            var data;
            var photoFaceId;

            let fileStream = fs.createReadStream('faces/brendon1.jpg');
            client.face.detectInStreamWithHttpOperationResponse(fileStream, {
              returnFaceId: true
            }).then(httpResponse => {
                data = JSON.parse(httpResponse.response.body)
                photoFaceId = data[0].faceId;
                //console.log(data[0].faceId);
                //console.log(photoFaceId);
                console.log("This photo's faceId is: ", photoFaceId);
            }).catch(err => { throw err; });

            //function addFaceIdToPerson()

            
            

            //Train PersonGroup

            //Identify whether member of PersonGroup

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
//};

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
    //ws.send(JSON.stringify(delta));
}