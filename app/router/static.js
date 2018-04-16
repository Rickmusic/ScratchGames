'use strict';

let express = require('express');
let router = express.Router();

let path = require('path');

let rootdir = { root: path.join(__dirname, '../../public') };

router.get('/', function(req, res) {
  res.sendFile(path.join('html/index.html'), rootdir);
});

router.get('/favicon*', function(req, res, next) {
  res.sendFile(
    path.join('favicon', req.originalUrl.replace(/\/favicon/, '')),
    rootdir,
    function(err) {
      if (err) next(err);
    }
  );
});

router.get(/.*.html$/, function(req, res, next) {
  res.sendFile(path.join('html', req.originalUrl), rootdir, function(err) {
    if (err) next(err);
  });
});

router.get(/.*.css$/, function(req, res, next) {
  res.sendFile(path.join('css', req.originalUrl), rootdir, function(err) {
    if (err) next(err);
  });
});

router.get(/.*.js$/, function(req, res, next) {
  res.sendFile(path.join('js', req.originalUrl), rootdir, function(err) {
    if (err) next(err);
  });
});

router.get(/.*.(gif|jpg|jpeg|png|ico|svg|ttf|woff|eot)$/, function(req, res, next) {
  res.sendFile(path.join('img', req.originalUrl), rootdir, function(err) {
    if (err) next(err);
  });
});

router.get(/.*.[^\s\/\?]*$/, function(req, res, next) {
  res.sendFile(path.join('misc', req.originalUrl), rootdir, function(err) {
    if (err) next(err);
  });
});

module.exports = router;
