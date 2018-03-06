$(function() {
  $.ajax({
    url: '/info',
    success: function(result) {
      $('#username').append(result.displayname);
      $('#profile').append($('<div />').html($('<p />').text('ID: ' + result.userid)));
      $('#profile').append($('<div />').html($('<p />').text('Account Status: ' + result.status)));
    },
    error: function(obj, status, textStatus) {
      $('body').append($('p').text('Ajax Failed (Status ' + textStatus + ')'));
    },
  });
});
