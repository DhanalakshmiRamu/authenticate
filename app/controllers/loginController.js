/**
 * Created by zendynamix on 30-05-2016.
 */

var express = require('express');
var mongoose = require('mongoose');
router = express.Router();
var cors = require('cors');
var bCrypt = require('bcrypt-nodejs');
var jwt    = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var secret = 'this is the secrete password';




module.exports = function (app) {
    app.use(router);
};

User =  mongoose.model('user');

router.use('/apis', expressJwt({secret: secret}));
router.use(function(err, req, res, next){
    if (err.constructor.name === 'UnauthorizedError') {
        res.status(401).send('Unauthorized Token Is not present');
    }
});
router.post('/api/signup', function(req, res, next) {
    var pwd=req.body.password;
    // find a user in Mongo with provided username
    User.findOne({'username':req.body.username},function(err, user) {
        // In case of any error return
        if (err){
            console.log('Error in SignUp: '+err);
            res.status(401).send('User does not exists register to the application');
        }
        // already exists
        if (user) {
            console.log('User already exists');
            res.status(401).send('User already exists');

        } else {
            // if there is no user with that email
            // create the user
            var newUser = new User();
            // set the user's local credentials
            newUser.username = req.body.username;
            newUser.password = createHash(pwd);
            newUser.email = req.body.email;
            newUser.firstName = req.body.firstName;
            newUser.lastName = req.body.lastName;
            newUser.createdDate = new Date();

            // save the user
            newUser.save(function(err) {
                if (err){
                    console.log('Error in Saving user: '+err);
                }
                console.log('User Registration succesful');
                res.send("user added sucessfully");
            });
        }
    });
});
var isValidPassword = function(user, pwd){
    console.log("in bcrypt"+pwd);
    return bCrypt.compareSync(pwd, user.password);
}
router.post('/api/login', function(req, res, next) {
    var pwd=req.body.password;
    User.findOne({ 'username' :  req.body.username },
        function(err, user) {
            // In case of any error, return using the done method
            if (err)
                return done(err);
            // Username does not exist, log error & redirect back
            if (!user){
                console.log('User Not Found with username '+req.body.username);
                res.status(401).send('Wrong user or password');
                return;
            }
            // User exists but wrong password, log the error

            console.log("before validate");
            console.log(pwd);
            var status=isValidPassword(user, pwd );

            if (!isValidPassword(user, pwd )){
                console.log('Invalid Password');
                res.status(401).send('Wrong user or password');
                return;
            }
            // User and password both match, return user from
            // done method which will be treated like success
            // We are sending the profile inside the token
            var token = jwt.sign(user, secret, { expiresInMinutes: 60*5 });
            res.json({ token: token });
        }
    );
});
router.get('/api/restricted', function (req, res) {
    console.log('user  is calling /api/restricted');
    res.json({
        name: 'super!!!!'
    });
});
router.get('/api/userDetails/count', function (req, res){
    User.count(function(err,userCount){
        if(err)
            res.send(err);
        var count = {userCount: userCount};
        res.send(count);
    });
})
router.get('/api/userDetails/get/:start/:range', function (req, res) {
    User.find({},function(err,result){
        if(err){
            res.send(err)
            console.log(err.stack)
        }else{
            res.send(result)
        }
    }).skip(parseInt(req.params.start)).limit(parseInt(req.params.range)).sort({ createdDate: -1 })
})
router.get('/api/userDetails/get/UpdatedDate/:start/:range', function (req, res) {
    User.find({},function(err,result){
        if(err){
            res.send(err)
            console.log(err.stack)
        }else{
            res.send(result)
        }

    }).skip(parseInt(req.params.start)).limit(parseInt(req.params.range)).sort({ modfiedDate: -1 })
})
router.get('/api/userDetails/delete/:id', function (req, res){
    User.findOne({'_id':req.params.id},function(err,userObj){
        if(err)
            res.send(err)
        userObj.remove(function (err) {
            if(err)
                res.send(err)
            res.send(userObj.username+' Account Deleted')
        });
    })
})
router.post('/api/userDetails/update', function (req, res) {
    User.findOne({'_id':req.body._id}, function (err, userObj) {
        if (err)
            res.send(err);
        if(userObj){
            if(req.body.newPassword && req.body.newPassword!=""){
                console.log(req.body.newPassword)
                userObj.password=createHash(req.body.newPassword)
            }
            userObj.username = req.body.username;
            userObj.email = req.body.email;
            userObj.firstName = req.body.firstName;
            userObj.lastName = req.body.lastName;
            userObj.modfiedDate = new Date();

            userObj.save(function(err){
                if(err)
                    res.send(err)
                console.log(userObj)
                res.send('User data successfully updated')
            })
        }else{
            res.send("no user exist with this name")
        }
        /*res.send(settingsObj);*/
    });
})
router.post('/api/userDetails/get/userDetails', function (req, res) {
    var decoded = jwt.decode(req.body.token);
    res.send(decoded)
})
var createHash = function(password){
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}
