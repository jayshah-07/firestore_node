const express = require("express");
const admin = require("firebase-admin");

const router = express.Router();
// load private credentials file downloaded from firebase serviceAccount
const serviceAccount = require("../ServiceAccountKey.json");

// initialize the sdk with serviceAccount credentials.
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// initialize the instance of firestore
//const db = admin.firestore();

const db = admin.firestore();
const settings = {/* your settings... */ timestampsInSnapshots: true};
db.settings(settings);

// reference the database collection
const usersCollection = db.collection("users");

// routes toget all users
router.get("/users", (req, res, next) => {
    // lets get all the document for users collection
    let allUsers = [];
    usersCollection.get().then(
        snapshot => {
            // for each document return data
            snapshot.forEach(doc => {
                allUsers.push({
                    "docID" : doc.id,
                    "userData": doc.data()
                });
            });

            // respond with the array created as json
            res.json({
                "statusCode": 200,
                "statusResponse": "OK",
                "message": "All users",
                "data": allUsers
            });
        }
    ).catch( err => {
        console.log("Error getting documents", err);
    });
});


// get user by ID
router.get("/users/:id", (req,res, next) => {
    let reqId = req.params.id;
    usersCollection.doc(reqId).get()
    .then(doc => {
        if(doc.exists){
            // if the data exists in the database
            res.json({
                "statusCode": 200,
                "statusResponse": "Ok",
                "message" : "User found",
                "userData" : doc.data()
            });
        }else{
            res.json({
                "statusCode": 404,
                "statusResponse": "Note found",
                "message": "User not found"
            })
        }
    }).catch(err => {
        console.log(err);
    });
});


// write request to firestore
// post request
router.post("/users", (req,res, next) => {
    // check if the json object in not null or empty
    if(req.body.name != null && req.body.email != null || req.body.name != undefined && req.body.email != undefined ){
        // need id for documents
        let docId = Math.floor(Math.random() * (9999-0000));
        
        // create object with params
        let newUser = {
            "name" : req.body.name,
            "email" : req.body.email
        }

        // send the use to firestore
        // and send it using the id
        // if its not present, it will fail
        let setNewUser = usersCollection.doc(String(docId)).set(newUser);

        res.json({
            "message": "user was successfully created"
        });
    } else {
        res.json({
            "message": "req.body parmas is undefined"
        });
    }
});

// update route
router.put("/users/:id", (req, res, next ) => {
    // manage the update function forr the user id sent
    // get the id of the documents to be updated
    let userId = req.params.id;

    // make transaction
    let transaction = db.runTransaction( transaction => {
        return transaction.get(usersCollection).then(doc => {
            // again check if there is something in the req body
            // remember you need body-parser for this
            if(req.body.name != undefined && req.body.email != undefined){
                // we pass the data as an object
                transaction.update(usersCollection.doc(userId), {
                    name : req.body.name,
                    email: req.body.email
                })
            } else {
                res.json({
                    "statusCode": "500",
                    "statusResponse": "Error parsing the data",
                    "message": "There is no data to parse"
                });
            }
        })
    }).then(result => {
        res.json({
            "statusCode": "200",
            "statuResponse": "ok",
            "message": "Transation Success"
        });
    }).catch(err => {
        console.log(err);
    });
});

// manage the delete request
// this is the delete route, we pass the ID and it will be gone.
router.delete("/users/:id", (req, res, next) => {
    let deleteDoc = usersCollection.doc(req.params.id).delete();

    res.json({
        "message": "User was deleted successfully"
    });
});

module.exports = router;

//https://github.com/AldoHub/NodeJS-Firestore-JSON-API/
//https://www.youtube.com/watch?v=-NsHWrrUgdk