$(document).ready(function() {

	$("#magicButton").click(function() {
		var userNameInput = $("#userNameInput").val();
		var passwordInput = $("#passwordInput").val();
		if (userNameInput.length === 0 || passwordInput.length === 0) {
			alert("Please enter a username AND password.");
		};
	});

	$("#submitButton").click(function(event) {
		var titleInput = $("#title").val();
		var bodyFormInput = $("#bodyForm").val();
		if ($.trim(titleInput).length === 0 || $.trim(bodyFormInput).length === 0) {
			event.preventDefault();
			alert("Please enter a title AND post.");
		};
	});

	$("#registrationSubmit").click(function(event) {
		var passwordInput = $("#newPassword").val();
		var confirmPassword = $("#confirmPassword").val();
		console.log(passwordInput);
		console.log(confirmPassword);
		if (passwordInput !== confirmPassword) {
			event.preventDefault();
			alert("Please make sure your passwords match.");
		};
	});

});