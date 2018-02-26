$(function() {
  $.ajax({
    url: '/info',
    success: function(result) {
      $('#profile').append('ID: ' + result.userid + '<br/>');
      $('#profile').append('Name: ' + result.displayname + '<br>');
      $('#profile').append('Account Status: ' + result.status + '<br/>');
    },
    error: function(obj, status, textStatus) {
      $('body').append($('p').text('Ajax Failed (Status ' + textStatus + ')'));
    },
  });
});
