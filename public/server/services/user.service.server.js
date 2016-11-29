/**
 * Created by Akshay on 13-10-2016.
 */

"use strict";
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');

module.exports = function(app, userModel){
    var auth = authorized;

    app.post("/msdapi/project/user/login", passport.authenticate('MSDAPI'), login);
    app.post("/msdapi/project/user/logout", logout);
    app.get("/msdapi/project/user/loggedin", loggedin);
    app.post('/msdapi/project/user', createUser);
    app.put('/msdapi/project/user/:id', updateUser);
    app.delete('/msdapi/project/user/:id', deleteUser);

    passport.use('MSDAPI', new LocalStrategy(projectLocalStrategy));

    function projectLocalStrategy(username, password,done){
        userModel
            .findUserByUsername(username)
            .then(
                function(user){
                    if(user && bcrypt.compareSync(password, user.password)){
                        return done(null, user);
                    }
                    else{
                        return done(null, false);
                    }
                },

                function (err) {
                    if(err){
                        return done(err);
                    }
                }
            );
    }

    function authorized(req, res, next){
        if(!req.isAuthenticated()){
            res.send(401);
        }
        else{
            next();
        }
    }

    function isAdmin(user){
        if(user.roles.indexOf('admin') > -1){
            return true;
        }
        return false;
    }

    function login(req, res){
        var user = req.user;
        delete user.password;
        res.json(user);
    }

    function logout(req, res){
        req.logOut();
        res.send(200);
    }

    function loggedin(req, res){
        res.send(req.isAuthenticated() ? req.user: '0');
    }
    
    function createUser(req, res) {
        var newUser = req.body;
        userModel.createUser(newUser).then(function(result) {
            res.jsonp(result); 
        });
    }
    
    function updateUser(req, res) {
        var id = req.params.id;
        var newUser = req.body;
        userModel.updateUser(id, newUser).then(function(result) {
            res.jsonp(result); 
        });
    }
    
    function deleteUser(req, res) {

        if(isAdmin(req.user)){
            userModel
                .deleteUser(req.params.id)
                .then(
                    function () {
                        return res.json(users);
                    },

                    function (err) {
                        res.status(400).send(err);
                    }
                )
        }
        else{
            res.status(403);
        }
    }
}