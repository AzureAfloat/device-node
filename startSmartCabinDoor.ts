//Create credentials
const FaceAPIClient = require('azure-cognitiveservices-face');
const CognitiveServicesCredentials = require('ms-rest-azure').CognitiveServicesCredentials;
let credentials = new CognitiveServicesCredentials("31fa991dd9824dacacfce77c70ed1892");
let client = new FaceAPIClient(credentials, 'westus');


export async function startSmartCabinDoor() {
    //Smart Cabin Door
    const fs = require('fs');

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

    // let person = await makePersonInGroup(testGroupId, "juliapin")
    // { personId: blah }
    let { personId } = await makePersonInGroup(testGroupId, "juliapin");


    //Delete a Person in a specified PersonGroup
    function deletePersonInGroup(pGroupId, pId) {
        client.person.deleteMethod(pGroupId, pId).then(del => {
            console.log("Just deleted Person ", pId, " from PersonGroup ", pGroupId)
        }).catch(err => {
            console.log(err);
        })
    }


    //Add Face to a Person
    var testPersistedFaceId;


    async function addFaceToPerson(pGroupId, pId, imagePath) {
        try {
            var imageFs = fs.createReadStream(imagePath)
         
            let theAddFaceCall = await client.person.addPersonFaceFromStreamWithHttpOperationResponse(pGroupId, pId, imageFs, {
                personGroupId: pGroupId,
                personId: pId
            }).then(httpResponse => {
                console.log("persistedFaceId from within .then() ", httpResponse.body.persistedFaceId)
                var perFaceId = httpResponse.body.persistedFaceId;
                testPersistedFaceId = perFaceId;
                console.log("testPersistedFaceId = ", testPersistedFaceId)
            }).catch(err => {
                console.log(err)
            })
        }
        catch (err) {
            console.log(err)
        }
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
}

async function makePersonInGroup(pGroupId, personName) {

    try {
        return await client.person.create(pGroupId, {
            personGroupId: pGroupId,
            name: personName
        });

    }
    catch (exc) {
        console.log(exc);
    }
}

//Train PersonGroup
//Queue it first?
function trainPersonGroup(pGroupId) {
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
function verify(faceId, pId, pGroupId) {
    client.face.verifyWithPersonGroupWithHttpOperationResponse(faceId, pId, pGroupId
    ).then(httpResponse => {
        //how will I know when result is positive or negative?
        console.log("")
    }).catch(err => {
        console.log(err);
    })
}

