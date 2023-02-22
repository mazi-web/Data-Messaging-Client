// const { compareSync } = require("bcryptjs");

// public/javasciprts/login.js
function login() {

    $('.error-msg').html("");
    
    if ($('#email').val() === "") {
        $('#email-error').html("email is required!");
        return;
    }
    if ($('#password').val() === "") {
        $('#password-error').html("Password is required");
        return;
    }

    let txdata = {
        email: $('#email').val(),
        password: $('#password').val()
    };

    $.ajax({
        url: '/clients/login',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(txdata),
        dataType: 'json'
    }).done(function (data, textStatus, jqXHR) {
        sessionStorage.setItem("userEmail", data.user.email);
        window.location.replace("home.html");
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        $('#login-error').html(jqXHR.responseJSON.msg);
    });
}

$(function () {
    $('#btnLogIn').click(login);
});