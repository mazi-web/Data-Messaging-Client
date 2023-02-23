var express = require("express");
var router = express.Router();
var Client = require("../models/client");
const amqp = require("amqplib");
const jwt = require("jwt-simple");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const { resolve } = require("path");
//const { fork } = require('child_process');

const secret = fs.readFileSync(__dirname + "/../keys/jwtkey").toString();

//Math Stuff
function randomize(toVal){
  let x = Math.floor(Math.random() * toVal+1)
  if(Math.random() < 0.5){
      return -1*x
  }
  else{
      return x
  }
}
function getDistance(lat1, long1, lat2, long2) {
  var radius = 6371; // Radius of the earth in km
  var distLat = toRad(lat2-lat1); 
  var distLon = toRad(long2-long1); 
  var x = Math.sin(distLat/2) * Math.sin(distLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(distLon/2) * Math.sin(distLon/2); 
  var y = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x)); 
  var radius = 6371; // Radius of the earth in km
  var finalAns = radius * y; // Distance in km
  return finalAns;
}

function toRad(deg) {
  return deg * (Math.PI/180)
}

setInterval(() => {
  let lat1;
  let lat2;
  let lat3;
  let long1;
  let long2;
  let long3;

  lat1 = randomize(90)
  lat2 = randomize(90)
  lat3 = randomize(90)
  long1 = randomize(180)
  long2 = randomize(180)
  long3 = randomize(180)

  msg = {
      coord1: lat1.toString()+','+long1.toString(),
      coord2: lat2.toString()+','+long2.toString(),
      coord3: lat3.toString()+','+long3.toString(),

      dist1: getDistance(lat1, long1, lat2, long2).toFixed(2).toString(),
      dist2: getDistance(lat1, long1, lat3, long3).toFixed(2).toString(),
      dist3: getDistance(lat3, long3, lat2, long2).toFixed(2).toString()
  }
  //console.log(msg)
  sendCoord(msg);
}, 1000);

async function send(req) {
  //return Promise(async resolve => {
  const msgBuffer = Buffer.from(JSON.stringify({ sender: req.body.sender, receiver: req.body.receiver, message: req.body.message }));
  try {
    const connection = await amqp.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();
    await channel.assertQueue("msgStream");
    await channel.sendToQueue("msgStream", msgBuffer);
    console.log("Sending message to msgStream queue");
    await channel.close();
    await connection.close();

    Client.findOne({ email: req.body.sender }, function (err, client) {
      if (err) {
        console.log("Error in database!")
      } else if (!client) {
        // Username not in the database
        console.log("Username not in the database");
      } else {
        let newMsg = { sender: req.body.sender, message: req.body.message }
        let found = false;
        for (let person in client.messageHistoryHash){
          if(client.messageHistoryHash[person].partner == req.body.receiver){
            client.messageHistoryHash[person].messageLogs.push(newMsg)
            found = true;
            break;
          }
        }
        if(found == false){
          let newMsg = { partner: req.body.receiver, messageLogs: [{ sender: req.body.sender, message: req.body.message }] }
          client.messageHistoryHash.push(newMsg);
        }

        client.save(function (err, device) {
          if (err) {
            console.log("Err in saving!")
          } else {
            console.log("Success sending message to the queue");
          }
        });
      }
    });

  } catch (ex) {
    console.log("SOMETHING IS WRONG WITH RABBIT")
    console.error(ex);
  }
  //});
 }

async function listen() {
 try {
   const connection = await amqp.connect("amqp://localhost:5672");
   const channel = await connection.createChannel();
   await channel.assertQueue("msgStream");
   await channel.consume("msgStream", message => {
   const input = JSON.parse(message.content.toString());

   Client.findOne({ email: input.receiver }, function (err, client) {
      if (err) {
        console.log("Err!")
      } else if (!client) {
        // Username not in the database
        console.log("Username not in the database");
      } else {
        let newMsg = { sender: input.sender, message: input.message }
        let found = false;
        for (let person in client.messageHistoryHash){
          if(client.messageHistoryHash[person].partner == input.sender){
            client.messageHistoryHash[person].messageLogs.push(newMsg)
            found = true;
            break;
          }
        }
        if(found == false){
          let newMsg = { partner: input.sender, messageLogs: [{ sender: input.sender, message: input.message }] }
          client.messageHistoryHash.push(newMsg);
        }

        client.save(function (err, device) {
          if (err) {
            console.log("Err2!")
          } else {
            console.log("Success receiving message");
          }
        });
      }
    });
    

    console.log(`Received Message`);
    channel.ack(message);
   });
   console.log(`Waiting for messages...`);
 } catch (ex) {
    console.log("SOMETHING IS WRONG WITH RABBIT")
   console.error(ex);
 }
}

router.post("/signup", function (req, res) {
  Client.findOne({ email: req.body.email }, function (err, client) {
    if (err) res.status(401).json({ success: false, err: err });
    else if (client) {
      res.status(401).json({ success: false, msg: "This email already used" });
    } else {
      //const passwordHash = bcrypt.hashSync(req.body.password, 10);
      const newClient = new Client({
        name: 'David',
        lastname: 'Mazi',
        email: req.body.email,
        password: req.body.password,
        phoneNumber: '9514819428',
        location: '',
        messageHistoryHash: [],
      });

      newClient.save(function (err, client) {
        if (err) {
          res.status(400).json({ success: false, err: err });
        } else {
          let msgStr = `Client (${req.body.email}) account has been created.`;
          res.status(201).json({ success: true, message: msgStr });
          console.log(msgStr);
        }
      });
    }
  });
});


router.post("/login", function (req, res) {
    if (!req.body.email || !req.body.password) {
      res.status(401).json({ error: "Missing email and/or password" });
      return;
    }
    // Get user from the database
    Client.findOne({ email: req.body.email }, function (err, client) {
      if (err) {
        res.status(400).send(err);
      } else if (!client) {
        // Username not in the database
        res.status(401).json({ msg: "Username not in the database" });
      } else {
        if (req.body.password == client.password) {
          listen();
          res.status(201).json({
            success: true,
            user: client,
            msg: "Login success",
          });
        } else {
          res
            .status(401)
            .json({ success: false, msg: "Invalid Username or Password!" });
        }
      }
    });
});

async function forAwaiting(req){
  await send(req)
}
router.post("/sendMessage", function (req, res) {
  //forAwaiting(req);
  send(req)
  res.status(201).json({msg: 'Message sent successfully'})
});

router.post("/listenForCoord", function (req, res) {
  listenCoord();
  res.status(201).json({msg: 'Listening for coordinates'})
});


var coordObj;
async function listenCoord() {
  try {
    const connection = await amqp.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();
    await channel.assertQueue("coordStream");
    await channel.consume("coordStream", message => {
    const input = JSON.parse(message.content.toString());
    //console.log(input);
      console.log(`Received coordinates`);
      coordObj = input;
      channel.ack(message);
    });
    console.log(`Waiting for coordinates...`);
  } catch (ex) {
    console.log("SOMETHING IS WRONG WITH RABBIT")
    console.error(ex);
  }
}
async function sendCoord(msg) {
  const msgBuffer = Buffer.from(JSON.stringify(msg));
  try {
    const connection = await amqp.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();
    await channel.assertQueue("coordStream");
    await channel.sendToQueue("coordStream", msgBuffer);
    //console.log("Sending message to coordStream queue");
    await channel.close();
    await connection.close();

  } catch (ex) {
    console.log("SOMETHING IS WRONG WITH RABBIT")
    console.error(ex);
  }
  finally{
    //Move this
    //listenCoord();
  }
}

router.post("/generateCoordinates", function (req, res) {
  //console.log(coordObj)
  res.status(201).json({msg: coordObj})
    //forked.send({ hello: 'world' });
});

router.post("/retrieveOldMessages", function(req, res){
  let msgFeed1 = '';
  let msgFeed2 = '';
  Client.findOne({ email: req.body.userEmail }, function (err, client) {
    if (err) {
      console.log("Err!")
    } else if (!client) {
      // Username not in the database
      console.log("Username not in the database");
    } else {
      for (let person in client.messageHistoryHash){
        if(client.messageHistoryHash[person].partner == req.body.un1){
          for(let msg of client.messageHistoryHash[person].messageLogs){
            msgFeed1 = msgFeed1 + msg.sender + ': ' + msg.message + '\n'; 
          }
          break;
        }
      }

      for (let person in client.messageHistoryHash){
        if(client.messageHistoryHash[person].partner == req.body.un2){
          for(let msg of client.messageHistoryHash[person].messageLogs){
            msgFeed2 = msgFeed2 + msg.sender + ': ' + msg.message + '\n'; 
          }
          break;
        }
      }
      res.status(201).json({ success: true, msgFeed1: msgFeed1, msgFeed2: msgFeed2 });
    }
  });
});

module.exports = router;