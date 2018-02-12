$(function () {
    $.ajax({
        url: "/user",
        success: function (result) {
            $('#displayname').text(result.displayname);
        },
        error: function (obj, status, textStatus) {
            $('body').append($('p').text('Ajax Failed'));
        }
    });
});
