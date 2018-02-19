$(function () {
    $.ajax({
        url: "/node/info",
        success: function (result) {
            $('#profile').append('ID: ' + result.userid + '<br/>');
            $('#profile').append('Username: ' + result.username + '<br/>');
            $('#profile').append('Name: ' + result.displayname);
            if (result.emails.length !== 0) {
                $('#profile').append('<br/>Emails:');
                for (let email of result.emails) {
                    $('#profile').append(' ' + email.value);
                }
            }   
        },
        error: function (obj, status, textStatus) {
            $('body').append($('p').text('Ajax Failed'));
        }
    });
});