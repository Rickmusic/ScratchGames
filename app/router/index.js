'use strict';

let express = require('express');
let router = express.Router();

let path = require('path');

let locations = require('./locations');
let { router: auth } = require('./auth');
let staticRoutes = require('./static');

let rootdir = { root: path.join(__dirname, '../../') };

router.use('/', locations);
router.use('/', auth);
router.use('/', staticRoutes);

module.exports = router;
