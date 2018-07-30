//Smart Cabin Door functionailty
var HashMap = require('hashmap');

//Create credentials
const FaceAPIClient = require('azure-cognitiveservices-face');
const CognitiveServicesCredentials = require('ms-rest-azure').CognitiveServicesCredentials;
let credentials = new CognitiveServicesCredentials("31fa991dd9824dacacfce77c70ed1892");
let client = new FaceAPIClient(credentials, 'westus');


export async function startSmartCabinDoor() {
    //filestream
    const fs = require('fs');

    //Creating a group
        //start with get function
    // var testGroupId = 'testgroup3';
    // getPersonGroup(testGroupId);

    //Creating a person
    // var testPersonName = "georgie2"
    // let { personId } = await makePersonInGroup(testGroupId, testPersonName);
    // console.log("Just created ", testPersonName, " with personId ", personId);

    //Adding a face to person
        //must include .jpg at end of path
    // var testImagePath = "faces/portrait1.jpg";

    // let { persistedFaceId } = await addFaceToPerson(testGroupId, personId, testImagePath);
    // console.log("Just added the persistedFaceId ", persistedFaceId, "to person of personId ", personId);
    

    //*****CELEB TESTING BELOW*****:
    var celebTestGroupId = "celebtestgroup5"
    // getPersonGroup(celebTestGroupId)

    let galGadotName = "galgadot";
    // await makePersonInGroup(celebTestGroupId, galGadotName);

    let oscarIsaacName = "oscarisaac";
    // let oscarIsaacId = fs.readFileSync(oscarIsaacName, "utf8");
    // console.log("the ID of ", oscarIsaacName, " is ", oscarIsaacId);

    // await makePersonInGroup(celebTestGroupId, oscarIsaacName);
    // await makePersonInGroup(celebTestGroupId, oscarIsaacName, testMap1);
    // console.log("Just created ", oscarIsaacName, "with personId ", testMap1.get(oscarIsaacName));
    // console.log("Stored key ", oscarIsaacName, " with value ", testMap1.get(oscarIsaacName));

    let constanceWuName = "constancewu";
    // let { personId: constanceWuId } = await makePersonInGroup(celebTestGroupId, constanceWuName);
    // await makePersonInGroup(celebTestGroupId, constanceWuName);
    
    let michaelfassbenderJpg1 = "celebrities/michaelfassbender1.jpg"

    // let tempConstance = constanceWuId;
    // console.log("Just created ", constanceWuName, "with personId ", constanceWuId);
    // console.log("Stored key ", constanceWuName, "with value ", testMap1.get(constanceWuName));

    let oscarIsaacJpg1 = "celebrities/oscarisaac1.jpg";
    let oscarIsaacJpg2 = "celebrities/oscarisaac2.jpg";
    let oscarIsaacJpg3 = "celebrities/oscarisaac3.jpg";
    let oscarIsaacJpg4 = "celebrities/oscarisaac4.jpg";
    // let { persistedFaceId: oscarIsaacFace1 } = await addFaceToPerson(celebTestGroupId, oscarIsaacName, oscarIsaacJpg1);
    // console.log("Just added the persistedFaceId ", oscarIsaacFace1);
    // let { persistedFaceId: oscarIsaacFace2 } = await addFaceToPerson(celebTestGroupId, oscarIsaacName, oscarIsaacJpg2);
    // console.log("Just added the persistedFaceId ", oscarIsaacFace2);
    // let { persistedFaceId: oscarIsaacFace3 } = await addFaceToPerson(celebTestGroupId, oscarIsaacName, oscarIsaacJpg3);
    // console.log("Just added the persistedFaceId ", oscarIsaacFace3, " to person of personId ", oscarIsaacName);

    let constanceWuJpg1 = "celebrities/constancewu1.jpg";
    let constanceWuJpg2 = "celebrities/constancewu2.jpg";
    let constanceWuJpg3 = "celebrities/constancewu3.jpg";
    let constanceWuJpg4 = "celebrities/constancewu4.jpg";
    // let { persistedFaceId: constanceWuFace1 } = await addFaceToPerson(celebTestGroupId, constanceWuName, constanceWuJpg1);
    // console.log("Just added the persistedFaceId ", constanceWuFace1);
    // let { persistedFaceId: constanceWuFace2 } = await addFaceToPerson(celebTestGroupId, constanceWuName, constanceWuJpg2);
    // console.log("Just added the persistedFaceId ", constanceWuFace2);
    // let { persistedFaceId: constanceWuFace3 } = await addFaceToPerson(celebTestGroupId, constanceWuName, constanceWuJpg3);
    // console.log("Just added the persistedFaceId ", constanceWuFace3, " to person of personId ", constanceWuName);

    listPersonsInGroup(celebTestGroupId);

    // trainPersonGroup(celebTestGroupId);

    // deletePersonInGroup(celebTestGroupId, galGadotName, fs);

    // verifyHelper(michaelfassbenderJpg1, celebTestGroupId);

    // getPerson(celebTestGroupId, constanceWuName, fs);

    // let address = "authorized_users/" + oscarIsaacName;
    // let pId = fs.readFileSync(address, 'utf8');
    // console.log("The ID of ", oscarIsaacName, " = ", pId);

    //Create a Person in specified PersonGroup
    async function makePersonInGroup(pGroupId, personName) 
    {
        try {
            let { personId } = await client.person.create(pGroupId, {
                personGroupId: pGroupId,
                name: personName
            });

            //Create new person's JSON file
            let address = "authorized_users/" + personName;
            let writeStream = fs.createWriteStream(address);
            writeStream.write(personId);

            // trainPersonGroup(pGroupId);
        }
        catch (err) {
            console.log(err);
        }
    }

    //Add Face to a Person
    //not sure why this is working with 2 returns...    
    async function addFaceToPerson(pGroupId, personName, imagePath)
    {
        try
        {   let address = "authorized_users/" + personName;
            let pId = fs.readFileSync(address, 'utf8');
            let imageFs = fs.createReadStream(imagePath)
            return await client.person.addPersonFaceFromStreamWithHttpOperationResponse(pGroupId, pId, imageFs,
            {
                personGroupId: pGroupId,
                personId: pId
            }).then(httpResponse => {
                let payload = httpResponse.body;
                //console.log("payload = ", payload)
                return payload;
            })
        }
        catch (err)
        {
            console.log(err);
        }
    }


    //*****this function also works only with the two returns... why?
    async function detectFace(imagePath)
    {
        try
        {
            // var data;
            // var photoFaceId;
            //Detect face, then parse JSON response to get faceID
            let imageFs = fs.createReadStream(imagePath);
            return await client.face.detectInStreamWithHttpOperationResponse(imageFs, {
                returnFaceId: true
            }).then(httpResponse => {
                let data = JSON.parse(httpResponse.response.body)
                let photoFaceId = data[0].faceId;
                // let photoFaceId = httpResponse.response.body
                return photoFaceId;
                // console.log("data[0].faceId = ", data[0].faceId);
                
                // console.log("This photo's faceId is: ", photoFaceId);
            })
            //.catch(err => { throw err; });
        }
        catch(err)
        {
            console.log(err);
        }
        console.log("photoFaceId = ", photoFaceId);
    }
    
    //Verify whether given Face belongs to a Person in PersonGroup
    //I'll have to make a wrapper function that compares to all Persons in group
    //faceId here comes from the detect face function (it's different from a persisitedFaceId)
    async function verify(faceId, pId, pGroupId, personName) 
    {
        try 
        {
            return await client.face.verifyWithPersonGroupWithHttpOperationResponse(faceId, pId, pGroupId
            ).then(httpResponse => {
                let verified = httpResponse.body.isIdentical;
                console.log("This face belongs to ", personName, "= ", verified);
                return verified;
            })
        }
        catch(err)
        {
            console.log(err);
        }
    }

    async function verifyHelper(imagePath, pGroupId)
    {
        let isAuthorized = false;
        let detectedFaceId = await detectFace(imagePath);
        var i;
        let allPersons = fs.readdirSync("authorized_users")

        console.log("Iterating through this list now: ", allPersons);

        
            for (i = 0; i < allPersons.length; i++)
            {
                let address = "authorized_users/" + allPersons[i];
                let pId = fs.readFileSync(address, 'utf8');
                let tempBool = await verify(detectedFaceId, pId, pGroupId, allPersons[i]);
                isAuthorized = tempBool;
                if (isAuthorized)
                {
                    break;
                }
            }

        if (isAuthorized)
        {
            console.log("Congratulations! Unlocking cabin door :)");
        }
        else
        {
            console.log("Sorry, you are not authorized to unlock the cabin door :(");
        }
    }
}

//Create new PersonGroup
    //First, get PersonGroup
    //if fails, create persongroup
function getPersonGroup(pGroupId) 
{
    client.personGroup.get(pGroupId
    ).then(pgId => {
        console.log("The PersonGroup", pGroupId, " already exists");
        return pgId;
    }).catch(err => {
        console.log("Making the PersonGroup ", pGroupId);
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

function getPerson(pGroupId, personName, fs)
{
    let address = "authorized_users/" + personName;
    let pId = fs.readFileSync(address, 'utf8');

    console.log("The ID of ", personName, " = ", pId);
    
    client.person.get(pGroupId, pId
    ).then(response => {
        console.log(response);
        return response;
    }).catch(err => {
        console.log(err);
    });
}

//List all Persons in specified PersonGroup
function listPersonsInGroup(pGroupId)
{
    client.person.listWithHttpOperationResponse(pGroupId
    ).then(httpResponse => {
        let personList = httpResponse.body
        console.log(personList)
    }).catch(err => {
        console.log(err);
    })
}

//Delete a Person from a specified PersonGroup
function deletePersonInGroup(pGroupId, personName, fs)
{
    let address = "authorized_users/" + personName;
    let pId = fs.readFileSync(address, 'utf8');
    client.person.deleteMethod(pGroupId, pId
    ).then(del => {
        console.log("Just deleted Person ", personName, " from PersonGroup ", pGroupId);
    }).catch(err => {
        console.log("personId ", pId, " not found in personGroup ", pGroupId);
        console.log("Error: ", err);
    })

    //Delete associated file holding personId
    fs.unlinkSync(address);
}

//TODO*************
//Delete a persistedFaceId from a person

//Train PersonGroup
//Queue it first?
function trainPersonGroup(pGroupId) 
{
    client.personGroup.trainWithHttpOperationResponse(pGroupId
    ).then(httpResponse => {
        console.log("Just trained the group ", pGroupId);
    }).catch(err => {
        console.log(err)
    })
}