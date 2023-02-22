// To use mongoDB
const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1/jcaInterview", { useNewUrlParser: true, useUnifiedTopology:true });


module.exports = mongoose;