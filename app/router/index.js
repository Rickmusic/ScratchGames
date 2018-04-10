'use strict';

let express = require('express');
let router = express.Router();

let locations = require('./locations');
let { router: auth } = require('./auth');
let staticRoutes = require('./static');

router.use('/', locations);
router.use('/', auth);
router.use('/', staticRoutes);

module.exports = router;
