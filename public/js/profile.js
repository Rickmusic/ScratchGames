$(function() {
  $.ajax({
    url: '/info',
    success: function(result) {
      $('#username').append(result.displayname);
      $('#profile').append('ID: ' + result.userid + '<br/>');
      $('#profile').append('Account Status: ' + result.status + '<br/>');
    },
    error: function(obj, status, textStatus) {
      $('body').append($('p').text('Ajax Failed (Status ' + textStatus + ')'));
    },
  });
});
