import { resolve } from "dns";

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
        // mockSensor("environment/outside/temperature", 68, 5, 3000);
        // mockSensor("environment/outside/humidity", 40, 3, 3000);

        //Smart Cabin Door
        //Create credentials
        const CognitiveServicesCredentials = require('ms-rest-azure').CognitiveServicesCredentials;
        let credentials = new CognitiveServicesCredentials("31fa991dd9824dacacfce77c70ed1892");
        const FaceAPIClient = require('azure-cognitiveservices-face');
        const fs = require('fs');

        let client = new FaceAPIClient(credentials, 'westus');

        //Create new PersonGroup
        //First, get PersonGroup
        //if fails, create persongroup
        function getPersonGroup(pGroupId) {
            client.personGroup.get(pGroupId
            ).then(pgId => {
                console.log("The PersonGroup", pGroupId, " already exists");
                return pgId;
            }).catch(err => {
                console.log("Making the PersonGroup", pGroupId);
                makePersonGroup(pGroupId);
            })
        }

        function makePersonGroup(pGroupId) //pGroupId is a string with NO CAPITAL LETTERS
        {
            client.personGroup.create(pGroupId, {
                name: pGroupId
            }).then(gid => {
                return gid;
            }).catch(err => {
                console.log(err)
            });
            console.log("Just created this PersonGroup: ", pGroupId);
        }

        var testGroupId = 'testgroup2';
       // getPersonGroup(testGroupId);

        //Create a Person in specified PersonGroup
        var personData;

        function makePersonInGroup(pGroupId, personName) {

            return client.person.create(pGroupId, {
                personGroupId: pGroupId,
                name: personName
            });
        }

        var thePromise = makePersonInGroup(testGroupId, "child1");
        var thePromiseJSON = thePromise.then(val => console.log("the personId is ", val.personId));
        // console.log(thePromise)
        // var thePromiseId = JSON.parse(thePromiseJSON)
        // console.log(thePromiseId)
        // var theId = thePromise.then(val => {return val.personId});
        
        //Delete a Person in a specified PersonGroup
        function deletePersonInGroup(pGroupId, pId)
        {
            client.person.deleteMethod(pGroupId, pId).then(del => {
                console.log("Just deleted Person ", pId, " from PersonGroup ", pGroupId)
            }).catch(err => {
                console.log(err);
            })
        }
        

        //Add Face to a Person

        var testPersistedFaceId;

        try{

            async function addFaceToPerson(pGroupId, pId, imagePath)
            {
                var imageFs = fs.createReadStream(imagePath)
                // console.log("HERE: " + pId);
                var theAddFaceCall = await client.person.addPersonFaceFromStreamWithHttpOperationResponse(pGroupId, pId, imageFs, {
                    personGroupId: pGroupId,
                    personId: pId
                }).then(httpResponse => {
                    console.log("persistedFaceId from within .then() ", httpResponse.body.persistedFaceId)
                    var perFaceId = httpResponse.body.persistedFaceId;
                    testPersistedFaceId = perFaceId;
                    console.log("testPersistedFaceId = ", testPersistedFaceId)

                    //var addFaceData = JSON.parse(httpResponse.response.body)
                    //console.log(addFaceData);
                    //testPersonId = addFaceData.personId;

                    //console.log(httpResponse)

                    // console.log("The persistedFaceId is: ", perFaceId);
                    // console.log("This person's PersonId is: ", pId)
                }).catch(err => {
                    console.log(err)
                })

                // console.log(theAddFaceCall)

                // testPersistedFaceId = theAddFaceCall.persistedFaceId;
                // console.log("testPersistedFaceId = ", testPersistedFaceId);
            }
            var thePersistedFaceId = thePromise.then(val => {
                    addFaceToPerson(testGroupId, val.personId, 'faces/portrait4.jpg');
                    
                    console.log("Just added persistedFaceId", testPersistedFaceId, " from photo ", 'faces/portrait4.jpg', " to the Person ", 
                    val.personId) //, " in the PersonGroup ", pGroupId);

                })
        }
        catch(err){
            console.log(err)
        }

        // addFaceToPerson(testGroupId, testPersonId, 'faces/brendon1.jpg');

        //Detect face, then parse JSON response to get faceID
            //This will be used when trying to unlock cabin door
        // var data;
        // var photoFaceId;

        // let fileStream = fs.createReadStream('faces/brendon1.jpg');
        // client.face.detectInStreamWithHttpOperationResponse(fileStream, {
        //   returnFaceId: true
        // }).then(httpResponse => {
        //     data = JSON.parse(httpResponse.response.body)
        //     photoFaceId = data[0].faceId;
        //     //console.log(data[0].faceId);
        //     //console.log(photoFaceId);
        //     console.log("This photo's faceId is: ", photoFaceId);
        // }).catch(err => { throw err; });

        //function addFaceIdToPerson()




        //Train PersonGroup
            //Queue it first?
        function trainPersonGroup(pGroupId)
        {
            client.personGroup.trainWithHttpOperationResponse(pGroupId
            ).then(httpResponse => {
                //what will go here?
                console.log("")
            }).catch(err => {
                console.log(err)
            })
        }    

        //Verify whether given Face belongs to a Person in PersonGroup
            //I'll have to make a wrapper function that compares to all Persons in group
        function verify(faceId, pId, pGroupId)
        {
            client.face.verifyWithPersonGroupWithHttpOperationResponse(faceId, pId, pGroupId
            ).then(httpResponse => {
                //how will I know when result is positive or negative?
                console.log("")
            }).catch(err => {
                console.log(err);
            })
        }

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

// function TakesTime(callback){
//     //var result = doAction();
//     callback(result);
// }

// function printData(data){
//     console.log(data);
// }

// TakesTime((res)=>{}));