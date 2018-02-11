'use strict';

let express = require('express');
let router = express.Router();

let path = require('path');

let passport = require('../auth');

router.get ('/', function (req, res) {
    if (req.isAuthenticated()) {
        res.sendFile(path.join(__dirname, '../..', 'public/home.html'));
    } else {
        res.sendFile(path.join(__dirname, '../..', 'public/index.html'));
    }
});

router.get ('/login', function (req, res) {
    res.render('login.ejs', { messages: req.flash('error') });
});

router.get ('/profile', function (req, res) {
    if (req.isAuthenticated()) {
        res.sendFile(path.join(__dirname, '../..', 'public/profile.html'));
    } else {
        res.redirect('/');
    }
});

router.post ('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true})
);

router.get('/logout', function (req, res){
    req.logout();
    res.redirect('/');
});

router.get ('/user', function (req, res) {
    res.send({
       displayname: req.user.displayName
    });  
});

router.get ('/info', function (req, res) {
    res.send({
        username: req.user.username,
        userid: req.user.id,
        displayname: req.user.displayName,
        emails: req.user.emails
    });
});

module.exports = router;
