// Declare Global App Variable
let Scratch = function () {};


// Defining Custom jQuery Functions
(function($) {

  // This helps load in the external js files as needed. //
  // The jquery original version is unstable//
  $.loadScript = function(url, callback) {
    $.ajax({
      url: url,
      datatype: 'script',
      success: callback,
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


/* Define Base Page Functions */
(function() {
  Scratch.base = function() {};

  let socket = io();

  // Attaches handlers to the baze UI elements. //
  Scratch.base.init = function() {
    // Top navigation bar //
    $('#navh').click(function () {
      socket.emit('navigate', { nav: 'lobbylist' });
    });
    $('#navp').click(function () {
      socket.emit('navigate', { nav: 'profile' });
    });
    $('#navl').click(function () {
      socket.emit('navigate', { nav: 'leaderboard' });
    });
    $('#navj').click(function () {
      socket.emit('navigate', { nav: 'joincode' });
    });

    // Adding Accordian Handler to side accordians //
    $('.accord')
      .find('.accordbtn')
      .click(function () {
          $(this)
              .next()
              .slideToggle('fast');
      });
  };

  Scratch.base.loadMain = function(html) {
    $('#main').load(html);
  };

  Scratch.base.loadModal= function(html) {
    $('#modal').load(html);
  };

  Scratch.base.navigate = function(nav) {
    if (nav.modal) Scrach.base.loadModal(nav.html); 
    else Scratch.base.loadMain(nav.html);
    if (!nav.js) return;
    $.loadScript(nav.js, function () {
      Scratch[nav.call].init();
    });
  };


  socket.on('navigate', function(nav) {
    Scratch.base.navigate(nav);
  });


  // Onload Function //
  $(document).ready(function() {
    Scratch.base.init();
    socket.emit('hello',{});
  });
})();


