const express = require("express");
const basicAPI = express();
const bodyParser = require("body-parser");

const PORT = process.env.PORT || 3000;

//  json parse config
basicAPI.use(bodyParser.urlencoded({ extended: false }));
// parse application
basicAPI.use(bodyParser.json());

// routes definition
const users = require("./routes/users");

// route usage
basicAPI.use("/api/v1/", users);

basicAPI.listen(PORT, ()=> {
    console.log(`API service is up and running @localhost : ${PORT}`);
})