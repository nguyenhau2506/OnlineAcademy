function onLoadPage() {
    const showPasswordBtn = $("#show-password");
    const passwordField = $("#password");

    showPasswordBtn.addClass('d-none');
    showPasswordBtn.on('click', function () {
        const type = passwordField.attr('type' )
        if (type === 'password') {
            passwordField.attr('type', 'text');
        }
        else{
            passwordField.attr('type', 'password');
        }
    })

    passwordField.on('keyup', function () {
        if ($(this).val() === "") {
            showPasswordBtn.addClass('d-none');
        }
        else {
            showPasswordBtn.removeClass('d-none');
        }
    });
}