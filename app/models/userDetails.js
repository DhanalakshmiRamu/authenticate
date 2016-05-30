/**
 * Created by zendynamix on 30-05-2016.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var userSchema = new mongoose.Schema(
    {
        username: String,
        password: String,
        email: String,
        firstName: String,
        lastName: String,
        createdDate:Date,
        isAdmin:Boolean,
        modfiedDate:Date

    },{collection: "user"});

module.exports =mongoose.model('user',userSchema)
