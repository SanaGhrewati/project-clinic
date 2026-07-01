<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تسجيل الدخول</title>

    <link rel="stylesheet" href="{{ asset('css/login.css') }}">
</head>
<body>

<div class="login-container">

    <h2>تسجيل الدخول</h2>

    <form id="loginForm">

        <input
            type="email"
            id="email"
            placeholder="البريد الإلكتروني"
            required
        >

        <input
            type="password"
            id="password"
            placeholder="كلمة المرور"
            required
        >

        <button type="submit">
        تسجيل دخول
        </button>

    </form>

    <p id="errorMessage"></p>

</div>

<script src="{{ asset('js/config.js') }}"></script>
<script src="{{ asset('js/auth.js') }}"></script>
</body>
</html>