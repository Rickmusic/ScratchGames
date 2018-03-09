/*
 * Based on express-socket.io-session package by oskosk
 * https://github.com/oskosk/express-socket.io-session
 */

'use strict';

let cookieParser = require('../cookie');
let session = require('../session');
let { passport } = require('../passport');

let socketSession = function(socket, next) {
  let req = socket.request;
  let res = { end: function() {} };

  let saveUninitializedSession = false;

  // originalHash, savedHash, originalId, cookieId
  // are variables present for replicating express-session autoSaving behavioiur
  let originalHash, savedHash;
  let originalId;
  let cookieId;
  let _onevent = socket.onevent;

  //  Override socket.on
  socket.onevent = function() {
    let _args = arguments;
    _onevent.apply(socket, _args);
    if (shouldSave(req)) req.session.save();
    if (req.user && req.user.changed()) req.user.save();
  };

  /*
   * The Express Middleware Stack
   * Calls cookieParser, express session, passport init, passport session
   */
  cookieParser(req, res, function(err) {
    if (err) return next(err);
    session(req, res, function(err) {
      if (err) return next(err);
      passport.initialize()(req, res, function(err) {
        if (err) return next(err);
        passport.session()(req, res, function(err) {
          if (err) return next(err);
          next();
        });
      });
    });
  });
  
  /*
   * These functions hash, isModified, isSaved, shouldSave
   * and shouldDestroy are canibalized from express-session
   * in order to this module being able to comply with the autoSave options.
   */

    function hash(sess) {
      return crc(JSON.stringify(sess, function(key, val) {
        if (key !== 'cookie') {
          return val;
        }
      }));
    }

    // check if session has been modified
    function isModified(sess) {
      return originalId !== sess.id || originalHash !== hash(sess);
    }

   // check if session has been modified
    function isModified(sess) {
      return originalId !== sess.id || originalHash !== hash(sess);
    }

    // check if session has been saved
    function isSaved(sess) {
      return originalId === sess.id && savedHash === hash(sess);
    }

    // determine if session should be destroyed
    function shouldDestroy(req) {
      return req.sessionID && unsetDestroy && req.session == null;
    }

    // determine if session should be saved to store
    function shouldSave(req) {
      // cannot set cookie without a session ID
      if (typeof req.sessionID !== 'string') {
        return false;
      }

      return !saveUninitializedSession && cookieId !== req.sessionID ? 
        isModified(req.session) : 
        !isSaved(req.session)
    }
};

module.exports = socketSession;
