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


// Onload Function //
$(document).ready(function() {

  loadBase();
  let curPage = getCookie('curPage');
  if (curPage === '') {
    setCookie('curPage', 'home', 30);
  } else {
    let x = loadLastpage(curPage);
    if (x === false) {
      $('#change').load('lobbyListSnip.html');
    }
  }

  // Attaches handlers to the baze UI elements. //
  function loadBase() {

    // Top navigation bar //
      $('#navp').click(function () {
          loadProfile();
      });
      $('#navh').click(function () {
          loadHome();
      });
      $('#navl').click(function () {
          loadMyLead();
      });
      $('#navj').click(function () {
          loadJoincode();
      });

      // Adding Accordian Handler to side accordians //
      $('.accord')
          .find('.accordbtn')
          .click(function () {
              $(this)
                  .next()
                  .slideToggle('fast');
          });
  }


  //loading of pages. Handling events on the uppermost navigation bar//
  function loadLastpage(curPage) {
    if (curPage === 'home') {
      loadHome();
      return true;
    } else if (curPage === 'profile') {
      loadProfile();
      return true;
    } else if (curPage === 'joincode') {
      loadJoincode();
      return true;
    } else if (curPage === 'myLeader') {
      loadMyLead();
      return true;
    }
    return false;
  }

  function loadMyLead() {
    setCookie('curPage', 'myLeader', 30);
    $('#change').load('leaderSnip.html');
  }

  function loadJoincode() {
    setCookie('curPage', 'joincode', 30);
    $('#change').load('joincodeSnip.html');
  }

  function loadHome() {
    setCookie('curPage', 'home', 30);
    $.loadScript('home.js', function(){
      Scratch.home.init();
    });
  }

  function loadProfile() {
    setCookie('curPage', 'profile', 30);
    /*$.loadScript('profile.js', function () {

    });*/
    $('#change').load('profileSnip.html');
  }


  // Library functions//

  function setCookie(cname, cvalue, exdays) {
      let d = new Date();
      d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
      let expires = 'expires=' + d.toUTCString();
      document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
  }

  function getCookie(cname) {
      let name = cname + '=';
      let decodedCookie = decodeURIComponent(document.cookie);
      let ca = decodedCookie.split(';');
      for (let i = 0; i < ca.length; i++) {
          let c = ca[i];
          while (c.charAt(0) == ' ') {
              c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
              return c.substring(name.length, c.length);
          }
      }
      return '';
  }
});
