/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');
const myfs = require('fs');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');
var bodyParser=require('body-parser');

// create a new express server
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

var cortex = require('./lib/cortex.js');

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);

  cortex.getCommands();

});

function getAllCommandsFromJson(callback){

try{
  var fs = require("fs");
  // Get content from file
  var contents = fs.readFileSync("./lib/info.json");
  // Define to JSON type
  var jsonContent = JSON.parse(contents);
  // Get Value from JSON
  
  callback(contents);
} catch(error){
  if (error != "")
    callback("err");
}
  
}

// get all data from info.json
app.get('/eeg/commands', function(req, res){
  getAllCommandsFromJson(function(data){
    res.send(data);
    res.end();
  });
});

var axios = require('axios');
// post commands in numbers (-1,0,1) to server and command squero 2.0
app.post('/eeg/tosphero', function(req, res){
  var commands = req.body.commands;

  // Post to sphero
  axios.post('http://localhost:8000/api/control', {
    "dir": commands
  });
  
  console.log(commands);

  res.send("RECEIVED");
  res.end();
});
// Save displayed table into json
app.post('/eeg/save', function(req, res){
    var document = req.body.data;
    console.log(document);
    myfs.writeFile('./lib/clicked/' + Date.now().toString() + ".json", JSON.stringify(document, null ,2), (error) => {
      if (error) console.error(error);
    });
    res.send("SAVED")
    res.end();
});