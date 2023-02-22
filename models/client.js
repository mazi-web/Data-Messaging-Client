const db = require("../db");

const clientSchema = new db.Schema({
    name: String,
    lastname: String,
    email: String,
    password: String,
    phoneNumber: String,
    location: String,
    messageHistoryHash: [{ partner: String, messageLogs: [{ sender: String, message: String }] }],
});


const Client = db.model("Client", clientSchema);

module.exports = Client;