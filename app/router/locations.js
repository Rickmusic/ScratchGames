'use strict';

let express = require('express');
let router = express.Router();

let path = require('path');

let { isAuthenticated } = require('./auth');

let rootdir = { root: path.join(__dirname, '../../') };

/*
 * Paths which are used in client to determine location
 * and history
 */

router.get('/home', isAuthenticated, function(req, res) {
  res.sendFile(path.join('public/html/base.html'), rootdir);
});

router.get('/profile', isAuthenticated, function(req, res) {
  res.sendFile(path.join('public/html/base.html'), rootdir);
});

router.get('/leaderboard', isAuthenticated, function(req, res) {
  res.sendFile(path.join('public/html/base.html'), rootdir);
});

router.get('/joincode', isAuthenticated, function(req, res) {
  res.sendFile(path.join('public/html/base.html'), rootdir);
});

router.get('/lobby', isAuthenticated, function(req, res) {
  res.sendFile(path.join('public/html/base.html'), rootdir);
});

module.exports = router;
