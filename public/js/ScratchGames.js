/* global io */

// Declare Global App Variable
let Scratch = function() {};

/* 
 * ----------------------------------------
 * Custom jQuery Functions
 * ---------------------------------------- 
 */
(function($) {
  // This helps load in the external js files as needed. //
  // The jquery original version is unstable//
  $.loadScript = function(url, callback) {
    $.ajax({
      url: url,
      datatype: 'script',
      success: () => callback(null),
      error: (obj, status, textStatus) =>
        callback(new Scratch.error.ajax('At loadscript', url, textStatus)),
      async: true,
    });
  };

  $.fn.serializeJSON = function() {
    let arr = this.serializeArray();
    let obj = {};
    for (let i of arr) {
      obj[i.name] = i.value;
    }
    return obj;
  };
})(jQuery);

/* 
 * ----------------------------------------
 * Scratch Navigation 
 * ---------------------------------------- 
 */
(function() {
  /*
   * @param {string} location to switch to
   */
  Scratch.nav = function(loc, args, callback) {
    let nav = {};
    /*
     * Nav Object Values
     * html: HTML snippet to load (or false)
     * modal: load into the modal window (boolean)
     *   (if true no history added, and as such title and location are ignored)
     * title: Window Title (false to keep same)
     * path: URL path (false to keep same)
     *   (must be the same as loc, or if using aliases same as one of loc's)
     * js: the javascript file to load (or false)
     * call: The 'Scratch.*' call to make when loaded (or false)
     */
    switch (loc) {
      case 'profile':
        nav = {
          html: 'snippets/profile.html',
          modal: false,
          title: 'Scratch Games',
          path: 'profile',
          js: 'profile.js',
          call: 'profile.init',
        };
        break;
      case 'leaderboard':
        nav = {
          html: 'snippets/leaderboard.html',
          modal: false,
          title: 'Scratch Games',
          path: 'leaderboard',
          js: false,
          call: false,
        };
        break;
      case 'createlobby':
        nav = {
          html: 'modals/createLobby.html',
          modal: true,
          call: 'lobbylist.create.init',
        };
        break;
      case 'lobby':
        nav = {
          html: 'snippets/lobby.html',
          modal: false,
          title: 'Scratch Games',
          path: 'lobby',
          js: 'lobby.js',
          call: 'lobby.init',
        };
        break;
      case 'game':
        nav = {
          html: false,
          modal: false,
          title: 'Scratch Games',
          path: 'game',
          js: false,
          call: false,
        };
        break;
      case 'joincode':
        nav = {
          html: 'snippets/joincode.html',
          modal: false,
          title: 'Scratch Games',
          path: 'joincode',
          js: false,
          call: false,
        };
        break;
      case 'lobbylist': // alias for home
      case 'home':
        nav = {
          html: 'snippets/lobbyList.html',
          modal: false,
          title: 'Scratch Games',
          path: 'home',
          js: 'lobbylist.js',
          call: 'lobbylist.init',
        };
        break;
      default:
        locationUknown.apply(this, Array.prototype.slice.call(arguments));
        break;
    }
    let _args = Array.prototype.slice.call(arguments);
    _args.unshift(nav);
    navigate.apply(this, _args);
  };

  /*
   * @param {string} location to switch to
   * @param {array} arguments to use for call [optional]
   * @param {function} function(err) which can have Scratch.error.* errors, null otherwise
   */
  Scratch.nav.goTo = function(loc, args, callback) {
    Scratch.nav(loc, args, callback);
  };

  /*
   * @param {string} location to switch to
   * @param {array} arguments to use for call [optional]
   * @param {function} function(err) which can have Scratch.error.* errors, null otherwise
   */
  Scratch.nav.redirect = function(loc, args, callback) {
    if (typeof args === 'function') {
      callback = args;
      args = undefined;
    }
    Scratch.nav(loc, args, { replaceState: true }, callback);
  };

  // Page First Time Load or Page Reloaded
  Scratch.nav.init = function(cb) {
    // On Back Button Press
    window.onpopstate = function(event) {
      Scratch.nav(event.state.loc, Scratch.nav.callback);
    };

    /* Allow server to make nav calls */
    Scratch.sockets.base.on('navigate', function(data) {
      Scratch.nav(data.loc, data.args, data.opts, serverNavigateCallback);
    });

    /* Lookup which location to load */
    let currentState = history.state || {};
    if (currentState.loc)
      return Scratch.nav(
        currentState.loc,
        { pushState: false },
        cb
      );
    Scratch.nav(
      window.location.pathname
        .replace(/^\//g, '')   // Remove leading '/'
        .replace(/#.*/g, '')   // Remove any anchor
        .replace(/\?.*/g, ''), // Remove any get query
      { replaceState: true },
      cb
    );
  };

  function serverNavigateCallback(err) {
    // TODO Determine how to deal with errors on server navigate
    if (err) console.log(err);
  }

  /*
   * @param {object} nav object
   * @param {string} location requested to be loaded
   * @param {array} arguments to nav.call [optional]
   * @param {object} options (should be provided only by other Scratch.nav calls) [optional]
   * @param {function} function(err) which can have Scratch.error.* errors, null otherwise
   */
  function navigate(nav, loc, args, opts, callback) {
    if (typeof opts === 'function') {
      callback = opts;
      opts = undefined;
    }
    if (typeof args === 'function') {
      callback = args;
      args = undefined;
    }
    else if (!Array.isArray(args)) {
      opts = args;
      args = undefined;
    }
    if (typeof callback !== 'function') callback(); /* throw standard js error for not a function */
    nav.args = args; /* stick args in nav so we have fewer args to internal function */
    createHistory(nav, loc, opts, callback);
  }

  function createHistory(nav, loc, opts, cb) {
    opts = opts || {};
    opts.noHistory = opts.noHistory || nav.modal || false;
    if (opts.noHistory) return loadHTML(nav, cb);

    /* Default Values */
    opts.pushState = opts.pushState || true;
    opts.loc = opts.loc || loc;
    opts.title = opts.title || nav.title || document.title;
    opts.path =
      opts.path ||
      nav.path ||
      window.location.pathname
        .replace(/^\//g, '')   // Remove leading '/'
        .replace(/#.*/g, '')   // Remove any anchor
        .replace(/\?.*/g, ''); // Remove any get query

    opts.state = opts.state || { loc: opts.loc };

    if (opts.replaceState)
        history.replaceState(opts.state, opts.title, opts.path);
    else if (opts.pushState)
      history.pushState(opts.state, opts.title, opts.path);
    loadHTML(nav, cb);
  }

  function loadHTML(nav, cb) {
    if (!nav.html) return loadJS(nav, cb);
    if (nav.modal)
      Scratch.base.loadModal(nav.html, err => {
        if (err) return cb.call(Scratch.nav, err);
        loadJS(nav, cb);
      });
    else
      Scratch.base.loadMain(nav.html, err => {
        if (err) return cb.call(Scratch.nav, err);
        loadJS(nav, cb);
      });
  }

  function loadJS(nav, cb) {
    if (!nav.js) makeFunctionCall(nav, cb);
    $.loadScript(nav.js, err => {
      if (err) return cb.call(Scratch.nav, err);
      makeFunctionCall(nav, cb);
    });
  }

  function makeFunctionCall(nav, cb) {
    if (!nav.call) return cb.call(Scratch.nav, null);
    if (!nav.args) nav.args = [];
    let namespaces = nav.call.split('.');
    let func = namespaces.pop();
    let context = Scratch;
    for (let i = 0; i < namespaces.length; i++) {
      if (!(typeof context[namespaces[i]] !== 'undefined')) return cb.call(Scratch.nav, new Scratch.error.varUndefined(context, namespaces[i]));
      context = context[namespaces[i]];
    }
    if (typeof context[func] !== 'function') return cb.call(Scratch.nav, new Scratch.error.notAFunction(context, func));
    context[func].apply(Scratch.nav, nav.args);
    cb.call(Scratch.nav, null);
  }

  /*
   * @param {string} location requested to be loaded
   * @param {array} arguments to nav.call [optional]
   * @param {object} options [optional]
   * @param {function} function(err) which can have Scratch.error.* errors, null otherwise
   */
  function locationUknown(loc, args, opts, callback) {
    if (typeof opts === 'function') {
      callback = opts;
      opts = undefined;
    }
    if (typeof args === 'function') {
      callback = args;
      args = undefined;
      opts = undefined;
    }
    callback(new Scratch.error.navUknownLocation(loc));
  }

  Scratch.nav.callback = function(err) {
    // TODO Include location in base html to display errors.
    if (err) console.log('Scratch Games Nav Error', err);
  };
})();

/* 
 * ----------------------------------------
 * Scratch Web Sockets
 * ---------------------------------------- 
 */
(function() {
  Scratch.sockets = function() {};
  Scratch.sockets.base = io();
})();

/* 
 * ----------------------------------------
 * Scratch Errors
 * ---------------------------------------- 
 */
(function() {
  Scratch.error = function() {};

  Scratch.error.varUndefined = function(context, variable) {
    this.name = 'Variable Undefined';
    this.message = 'Variable Undefined: ' + context + '.' + variable;
    this.context = context;
    this.variable = variable
    this.stack = new Error().stack;
  };
  Scratch.error.varUndefined.prototype = new Error();

  Scratch.error.notAFunction = function(context, variable) {
    this.name = 'Not A Function';
    this.message = 'Variable is not a Function: ' + context + '.' + variable;
    this.context = context;
    this.variable = variable
    this.stack = new Error().stack;
  };
  Scratch.error.notAFunction.prototype = new Error();

  Scratch.error.navUknownLocation = function(loc) {
    this.name = 'Scratch Nav Location Unknown';
    this.message = 'Unkown Nav Location: ' + loc;
    this.location = loc;
    this.stack = new Error().stack;
  };
  Scratch.error.navUknownLocation.prototype = new Error();

  Scratch.error.ajax = function(message, url, status) {
    this.name = 'AJAX Error';
    this.message = message + ' ' + url + ' Status: ' + status;
    this.url = url;
    this.status = status;
    this.stack = new Error().stack;
  };
  Scratch.error.ajax.prototype = new Error();
})();
