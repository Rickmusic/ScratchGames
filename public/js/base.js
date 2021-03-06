/* global Scratch */
Scratch.base = function() {};

/* Define Base Page Functions */
(function() {
  let socket = Scratch.sockets.base; /* Links to app/socket/base.js */

  // Attaches handlers to the baze UI elements. //
  Scratch.base.init = function() {
    // Top navigation bar //
    // TODO Replace callback with local error handling callback function
    $('#navh').click(function() {
      Scratch.nav.goTo('lobbylist', Scratch.nav.callback);
    });
    $('#navp').click(function() {
      Scratch.nav.goTo('profile', Scratch.nav.callback);
    });
    $('#navl').click(function() {
      Scratch.nav.goTo('leaderboard', Scratch.nav.callback);
    });
    $('#navj').click(function() {
      Scratch.nav.goTo('joincode', Scratch.nav.callback);
    });

    // Adding Accordian Handler to side accordians //
  };

  Scratch.base.loadMain = function(html, callback) {
    $('#main').load(html, function(response, status, xhr) {
      if (status === 'error')
        return callback(new Scratch.error.ajax('At loadMain', html, xhr.statusText));
      callback(null);
    });
  };

  Scratch.base.loadModal = function(html, callback) {
    $('#modalContent').load(html, function(response, status, xhr) {
      if (status === 'error')
        return callback(new Scratch.error.ajax('At loadModal', html, xhr.statusText));
      $('#myModal').modal({ show: false });
      $('#myModal').modal('show');
      callback(null);
    });
  };

  Scratch.base.hideModal = function() {
    $('#myModal').modal('toggle');
  };
  /*Scratch.base.addChat = function(name){
    console.log("adding chat " + name);
  };*/
})();

// Onload Function //
$(document).ready(function() {
  Scratch.base.init();
  Scratch.nav.init(function(err) {
    // TODO better error handeling.
    // Will throw Scratch.error.ajax if AJAX fails
    // Will throw Scratch.error.navUknownLocation if brower url path didn't match a location.
    //   You can match to check for particular errors  ex: if (err instanceof Scratch.error.ajax)
    if (err) console.log(err);
  });
});
