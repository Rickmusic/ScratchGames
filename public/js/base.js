/* global Scratch */
/* Define Base Page Functions */
(function() {
  Scratch.base = function() {};

  let socket = Scratch.sockets.base; /* Links to app/socket/base.js */

  // Attaches handlers to the baze UI elements. //
  Scratch.base.init = function() {
    // Top navigation bar //
    // TODO Replace callback with local error handling callback function
    $('#navh').click(function() {
      Scratch.navigate('lobbylist', Scratch.navigate.callback);
    });
    $('#navp').click(function() {
      Scratch.navigate('profile', Scratch.navigate.callback);
    });
    $('#navl').click(function() {
      Scratch.navigate('leaderboard', Scratch.navigate.callback);
    });
    $('#navj').click(function() {
      Scratch.navigate('joincode', Scratch.navigate.callback);
    });

    // Adding Accordian Handler to side accordians //
    $('.accord')
      .find('.accordbtn')
      .click(function() {
        $(this)
          .next()
          .slideToggle('fast');
      });
  };

  Scratch.base.loadMain = function(html, callback) {
    $('#main').load(html, function(response, status, xhr) {
      if (status === 'error')
        return callback(
          new Scratch.error.ajax('At loadMain', html, xhr.statusText)
        );
      callback(null);
    });
  };

  Scratch.base.loadModal = function(html, callback) {
    $('#modal').load(html, function(response, status, xhr) {
      if (status === 'error')
        return callback(
          new Scratch.error.ajax('At loadModal', html, xhr.statusText)
        );
      callback(null);
    });
  };

  socket.on('navigate', function(nav) {
    Scratch.navigate(nav);
  });
})();

// Onload Function //
$(document).ready(function() {
  Scratch.base.init();
  Scratch.navigate.init(function(err) {
    // TODO better error handeling.
    // Will throw Scratch.error.ajax if AJAX fails
    // Will throw Scratch.error.navUknownLocation if brower url path didn't match a location.
    //   You can match to check for particular errors  ex: if (err instanceof Scratch.error.ajax)
    if (err) console.log(err);
  });
});
