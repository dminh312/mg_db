var mongoose = require('mongoose');

// Schema: structure of collection
var UserSchema = mongoose.Schema({
    username: String,
    password: String,
    role: String
});

var UserModel = mongoose.model("users", UserSchema);

module.exports = UserModel;
