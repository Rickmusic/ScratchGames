$(function() {
  $('form#login').submit(function() {
    console.log('Login Form Submitted');
    $.ajax({
      url: '/login/ajax',
      method: 'POST',
      data: $('#login').serialize(),
      success: function(result) {
        console.log('Ajax Connected', result);
        if (result.success) {
          window.location.replace(result.redirect);
        } else {
          $('#message').text(result.message);
        }
      },
      error: function(obj, status, textStatus) {
        console.log('Ajax Failed (Status' + textStatus + ')');
        $('#message').text(
          'Could not connect to server, please try again later'
        );
      },
    });
    this.reset();
    return false;
  });

  $('form#register').submit(function() {
    console.log('Register Form Submitted');
    $.ajax({
      url: '/signup',
      method: 'POST',
      data: $('#signup').serialize(),
      success: function(result) {
        console.log('Ajax Connected', result);
        if (result.success) {
          window.location.replace(result.redirect);
        } else {
          $('#signupMessage').text(result.message);
        }
      },
      error: function(obj, status, textStatus) {
        console.log('Ajax Failed (Status' + textStatus + ')');
        $('#signupMessage').text(
          'Could not connect to server, please try again later'
        );
      },
    });
    this.reset();
    return false;
  });
});
