// Onload Function //
$(document).ready(function() {
  let curPage = getCookie('curPage');
  if (curPage === '') {
    setCookie('curPage', 'home', 30);
  } else {
    let x = loadLastpage(curPage);
    if (x === false) {
      $('#change').load('lobbySnip.html');
    }
  }
  loadSurround();
});

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

function loadLastpage(curPage) {
  if (curPage === 'home') {
    loadLobbyList();
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

function loadLobbyList() {
  setCookie('curPage', 'home', 30);
  $('#change').load('lobbySnip.html', function() {
    $('#createbtn').click(function() {
      $('.modal').css('display', 'block');
    });
    $('.close').click(function() {
      $('.modal').css('display', 'none');
    });
  });
}

function loadProfile() {
  setCookie('curPage', 'profile', 30);
  $('#change').load('profileSnip.html');
}

function loadSurround() {
  $('#navp').click(function() {
    loadProfile();
  });
  $('#navh').click(function() {
    loadLobbyList();
  });
  $('#navl').click(function() {
    loadMyLead();
  });
  $('#navj').click(function() {
    loadJoincode();
  });
  // Adding Accordian Handler to side accordians //
  $('.accord')
    .find('.accordbtn')
    .click(function() {
      $(this)
        .next()
        .slideToggle('fast');
    });
  // Adding Accordian Handler to bottom accordians //
  $('.accord')
    .find('.accordbtn2')
    .click(function() {
      $(this)
        .next()
        .slideToggle('fast');
      //Hide the other panels
      $('.accordcon')
        .not($(this).next())
        .slideUp('fast');
    });
}
