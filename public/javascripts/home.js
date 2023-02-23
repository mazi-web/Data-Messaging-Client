//var Client = require("../../models/client");

//import Client from "../../models/client.js";

//import { MongoClient } from "../../node_modules/mongodb";


$(function () {
    $("#btnLogOut").click(logout);
    $("#btnsendMessage1").click(sendMessage1);
    $("#btnsendMessage2").click(sendMessage2);
    $("#btnGridView").click(goToGrid);
    $("#btnReturn").click(goToHome);

    
    if(sessionStorage.getItem("userEmail") == 'mazi@arizona.edu'){
        console.log("Changing");
        $("#un1").html("Jacques");
        $("#un2").html("Nissa");

        sessionStorage.setItem("un1", 'kash@arizona.edu');
        sessionStorage.setItem("un2", 'nissa@arizona.edu');
    }

    if(sessionStorage.getItem("userEmail") == 'kash@arizona.edu'){
        $("#un1").html("David");
        $("#un2").html("Nissa");

        sessionStorage.setItem("un1", 'mazi@arizona.edu');
        sessionStorage.setItem("un2", 'nissa@arizona.edu');
    }

    if(sessionStorage.getItem("userEmail") == 'nissa@arizona.edu'){
        $("#un1").html("David");
        $("#un2").html("Jacques");

        sessionStorage.setItem("un1", 'mazi@arizona.edu');
        sessionStorage.setItem("un2", 'kash@arizona.edu');
    }

    //watchDataBase();
    //generateOldMessages();
    //setInterval(generateOldMessages, 500);
    startListeningForCoord();
    generateOldMessages();
    setInterval(generateCoordinates, 500);
});

function goToGrid(){
    window.location.replace("grid.html");
}

function goToHome(){
    window.location.replace("home.html");
}

function startListeningForCoord(){
    let shell = {}
    $.ajax({
        url: '/clients/listenForCoord',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(shell),
        dataType: 'json'
    }).done(function (data, textStatus, jqXHR) {
        console.log("Listening for coodinates")
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        console.log("Failed to listen for coodinates");
    });
}

function logout() {
    sessionStorage.removeItem("userEmail");
    window.location.replace("login.html");
}

function sendMessage1(){
    if($("#sendMessage1").val() == ""){
        return
    }
    console.log("About to send")
    let content = {
        sender: sessionStorage.getItem("userEmail"),
        receiver: sessionStorage.getItem("un1"),
        message: $("#sendMessage1").val()
    };

    $.ajax({
        url: '/clients/sendMessage',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(content),
        dataType: 'json'
    }).done(function (data, textStatus, jqXHR) {
        console.log("Message sent successfully")
        setTimeout(generateOldMessages, 200)
        
        //$("#sendMessage1").val("").trigger('change');
        //$('#sendMessage1').attr('value', '');
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        $('#login-error').html(jqXHR.responseJSON.msg);
    });
    $("#sendMessage1").val("");
}

function sendMessage2(){
    if($("#sendMessage2").val() == ""){
        return
    }
    let content = {
        sender: sessionStorage.getItem("userEmail"),
        receiver: sessionStorage.getItem("un2"),
        message: $("#sendMessage2").val()
    };

    $.ajax({
        url: '/clients/sendMessage',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(content),
        dataType: 'json'
    }).done(function (data, textStatus, jqXHR) {
        console.log("Message sent successfully")
        setTimeout(generateOldMessages, 200)
        //$("#sendMessage2").val("").trigger('change');
        //$('#sendMessage2').attr('value', '');
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        console.log("Message not sent successfully");
    });
    $("#sendMessage2").val("");
}

function generateOldMessages(){
    let content = {
        userEmail: sessionStorage.getItem("userEmail"),
        un1: sessionStorage.getItem("un1"),
        un2: sessionStorage.getItem("un2"),
    };

    $.ajax({
        url: '/clients/retrieveOldMessages',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(content),
        dataType: 'json'
    }).done(function (data, textStatus, jqXHR) {
        console.log("Message retrieved successfully")
        //alert(data.msgFeed1)
        $("#messageUser1").prop("disabled", false);
        $("#messageUser1").html(data.msgFeed1);
        $("#messageUser1").prop("disabled", true);
        $("#messageUser2").prop("disabled", false);
        $("#messageUser2").html(data.msgFeed2);
        $("#messageUser2").prop("disabled", true);
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        console.log("Message not sent successfully");
    });
}

function generateCoordinates(){

    let content = {
    };

    $.ajax({
        url: '/clients/generateCoordinates',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(content),
        dataType: 'json'
    }).done(function (msg, textStatus, jqXHR) {
        //alert(msg.msg.coord1);
        $("#row2col3").html(msg.msg.dist1);
        $("#row2col4").html(msg.msg.dist2);

        $("#row3col2").html(msg.msg.dist1);
        $("#row3col4").html(msg.msg.dist3);

        $("#row4col2").html(msg.msg.dist2);
        $("#row4col3").html(msg.msg.dist3);

        if(sessionStorage.getItem("userEmail") == 'mazi@arizona.edu'){
            $("#currentLocation").prop("disabled", false)
            $("#currentLocation").val(msg.msg.coord1)
            $("#currentLocation").prop("disabled", true)

            $("#currentLocation2").prop("disabled", false)
            $("#currentLocation2").val(msg.msg.coord1)
            $("#currentLocation2").prop("disabled", true)

            $("#distanceUser1").prop("disabled", false)
            $("#distanceUser1").val(msg.msg.dist1)
            $("#distanceUser1").prop("disabled", true)

            $("#distanceUser2").prop("disabled", false)
            $("#distanceUser2").val(msg.msg.dist2)
            $("#distanceUser2").prop("disabled", true)
        }

        if(sessionStorage.getItem("userEmail") == 'kash@arizona.edu'){
            $("#currentLocation").prop("disabled", false)
            $("#currentLocation").val(msg.msg.coord2)
            $("#currentLocation").prop("disabled", true)

            $("#currentLocation2").prop("disabled", false)
            $("#currentLocation2").val(msg.msg.coord2)
            $("#currentLocation2").prop("disabled", true)

            $("#distanceUser1").prop("disabled", false)
            $("#distanceUser1").val(msg.msg.dist1)
            $("#distanceUser1").prop("disabled", true)

            $("#distanceUser2").prop("disabled", false)
            $("#distanceUser2").val(msg.msg.dist3)
            $("#distanceUser2").prop("disabled", true)
        }

        if(sessionStorage.getItem("userEmail") == 'nissa@arizona.edu'){
            $("#currentLocation").prop("disabled", false)
            $("#currentLocation").val(msg.msg.coord3)
            $("#currentLocation").prop("disabled", true)

            $("#currentLocation2").prop("disabled", false)
            $("#currentLocation2").val(msg.msg.coord3)
            $("#currentLocation2").prop("disabled", true)

            $("#distanceUser1").prop("disabled", false)
            $("#distanceUser1").val(msg.msg.dist2)
            $("#distanceUser1").prop("disabled", true)

            $("#distanceUser2").prop("disabled", false)
            $("#distanceUser2").val(msg.msg.dist3)
            $("#distanceUser2").prop("disabled", true)
        }
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        console.log("Fail to get coordinates");
    });

    /*forked.on('message', (msg) => {
        //console.log('Message from child', msg);
        
    });*/

    //forked.send({ hello: 'world' });
}

function watchDataBase(){
    const uri = "mongodb://127.0.0.1/";
    const clientDB = new MongoClient(uri);
    let changeStream;
    async function watchDB() {
    try {
        const database = clientDB.db("jcaInterview");
        const Client = database.collection("Client");
        // Open a Change Stream on the "haikus" collection
        changeStream = Client.watch();
        // Print change events
        for await (const change of changeStream) {
            //console.log("Received change:\n", change);
            Client.findOne({ email: sessionStorage.getItem("userEmail") }, function (err, client) {
                if (err) {
                  console.log("Err!")
                } else if (!client) {
                  // Username not in the database
                  console.log("Username not in the database");
                } else {
                  for (let person in client.messageHistoryHash){
                    if(client.messageHistoryHash[person].partner == sessionStorage.getItem("un1")){
                      let msgFeed = '';
                      for(let msg of client.messageHistoryHash[person].messageLogs){
                        msgFeed = msgFeed + msg.sender + ': ' + msg.message + '\n'; 
                      }
                      $("#messageUser1").html(msgFeed)
                      break;
                    }
                  }

                  for (let person in client.messageHistoryHash){
                    if(client.messageHistoryHash[person].partner == sessionStorage.getItem("un2")){
                      let msgFeed = '';
                      for(let msg of client.messageHistoryHash[person].messageLogs){
                        msgFeed = msgFeed + msg.sender + ': ' + msg.message + '\n'; 
                      }
                      $("#messageUser2").html(msgFeed)
                      break;
                    }
                  }
                }
            });

            
        }
        await changeStream.close();
        
    } finally {
        await clientDB.close();
    }
    }
    watchDB().catch(console.dir);
}