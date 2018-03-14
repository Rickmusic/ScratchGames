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
  Scratch.navigate = function(loc, callback) {
    let nav = {};
    /*
     * Nav Object Values
     * html: HTML snippet to load (or false)
     * modal: load into the modal window (boolean)
     *   (if true, title and location are ignored)
     * title: Window Title (false to keep same)
     * path: URL path (false to keep same)
     *   (must be the same as 'loc')
     * js: the javascript file to load (or false)
     * init: The 'Scratch.*.init()' call to make when loaded (or false)
     */
    switch (loc) {
      case 'profile':
        nav = {
          html: 'snippets/profile.html',
          modal: false,
          title: 'Scratch Games',
          path: 'profile',
          js: 'profile.js',
          init: 'profile',
        };
        break;
      case 'leaderboard':
        nav = {
          html: 'snippets/leaderboard.html',
          modal: false,
          title: 'Scratch Games',
          path: 'leaderboard',
          js: false,
          init: false,
        };
        break;
      case 'lobby':
        nav = {
          html: 'snippets/lobby.html',
          modal: false,
          title: 'Scratch Games',
          path: 'lobby',
          js: 'lobby.js',
          init: false,
        };
        break;
      case 'game':
        nav = {
          html: false,
          modal: false,
          title: 'Scratch Games',
          path: 'game',
          js: false,
          init: false,
        };
        break;
      case 'joincode':
        nav = {
          html: 'snippets/joincode.html',
          modal: false,
          title: 'Scratch Games',
          path: 'joincode',
          js: false,
          init: false,
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
          init: 'lobbylist',
        };
        break;
      default:
        locationUknown.apply(this, Array.prototype.slice.call(arguments));
        break;
    }
    let args = Array.prototype.slice.call(arguments);
    args.unshift(nav);
    navigate.apply(this, args);
  };

  // Page First Time Load or Page Reloaded
  Scratch.navigate.init = function(cb) {
    // On Back Button Press
    window.onpopstate = function(event) {
      Scratch.navigate(event.state.loc, Scratch.navigate.callback);
    };
    let currentState = history.state || {};
    if (currentState.loc)
      return Scratch.navigate(
        currentState.loc,
        { firstLoad: true, recall: true },
        cb
      );
    Scratch.navigate(
      window.location.pathname
        .replace(/^\//g, '')
        .replace(/#.*/g, '')
        .replace(/\?.*/g, ''),
      { firstLoad: true, recall: false },
      cb
    );
  };

  function navigate(nav, loc, opts, callback) {
    if (typeof opts === 'function') {
      callback = opts;
      opts = undefined;
    }
    if (nav.modal) return loadHTML(nav, callback);
    opts = opts || {};
    opts.title = opts.title || nav.title || document.title;
    opts.path =
      opts.path || nav.path || window.location.pathname.replace(/^\//g, '');
    if (opts.firstLoad && !opts.recall)
      history.replaceState({ loc: loc }, opts.title, opts.path);
    else history.pushState({ loc: loc }, opts.title, opts.path);
    loadHTML(nav, callback);
  }

  function loadHTML(nav, cb) {
    if (!nav.html) return loadJS(nav, cb);
    if (nav.modal)
      Scratch.base.loadModal(nav.html, err => {
        if (err) return cb(err);
        loadJS(nav, cb);
      });
    else
      Scratch.base.loadMain(nav.html, err => {
        if (err) return cb(err);
        loadJS(nav, cb);
      });
  }

  function loadJS(nav, cb) {
    if (!nav.js) doneLoading(nav, cb);
    $.loadScript(nav.js, err => {
      if (err) return cb(err);
      doneLoading(nav, cb);
    });
  }

  function doneLoading(nav, cb) {
    if (!nav.init) return cb(null);
    Scratch[nav.init].init();
    cb(null);
  }

  function locationUknown(loc, opts, callback) {
    if (typeof opts === 'function') {
      callback = opts;
      opts = undefined;
    }
    callback(new Scratch.error.navUknownLocation(loc));
  }

  Scratch.navigate.callback = function(err) {
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
