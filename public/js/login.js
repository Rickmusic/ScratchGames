$(function () {
	$('form').submit (function () {
		console.log("Form Submitted");
		$.ajax({
			url: "/node/login",
			method: "POST",
			data: $("#login").serialize(),
			success: function (result) {
				console.log("Ajax Connected", result);
				if (result.success) {
					window.location.replace(result.redirect);
				}
				else {
					$('#message').text(result.message);
				}
			},
			error: function (obj, status, textStatus) {
				console.log("Ajax Failed");
				$('#message').text('Could not connect to server, please try again later');
			}
		});
		this.reset();
		return false;
	});
	$('input').on('input', function() {
		$('#message').text();
	});
});