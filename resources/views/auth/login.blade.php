<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx', 'resources/css/login.css', 'resources/js/pages/login.jsx'])
    <meta name="csrf-token" content="{{ csrf_token() }}">
</head>

<body>
    <div id="login-root"></div>
</body>

</html>