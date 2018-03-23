'use strict';

let crypto = require('crypto');

let namespaces = {};
let io;

let exists = function(identifier) {
  return namespaces[identifier] !== undefined;
}

let create = function(identifier) {
  let id = (function recGen(io) {
    let id = crypto
      .randomBytes(64)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    if (io.nsps[id]) return recGen(io);
    return id;
  })(io);
  namespaces[identifier] = id;
  return io.of(id);
};

let get = function(identifier) {
  if (!namespaces[identifier]) return null;
  return io.of(namespaces[identifier]);
};

let destroy = function(identifier) {
  if (!namespaces[identifier]) return;
  nspIO = namespace[identifier];
  for(let socket of Object.keys(nspIO.connected)) {
    nspIO.connected[socket].disconnect();
  }
  nspIO.removeAllListerners();
  delete io.nsps[nspIO.name];
  delete namespace[identifier];
};

let init = function(newio) {
  io = newio;
};

module.exports = { exists, create, get, destroy, init };

