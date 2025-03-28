<!DOCTYPE html>
<html>
<head>
    <title>Laravel Course Platform</title>
    <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" />
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="bg-gray-100 ">
<header class="px-20 py-4 flex items-center justify-between ">
    <div class="text-xl font-bold text-cyan-950">
        Cobol Training
    </div>
    <nav class="flex-1 flex justify-center items-center text-center text-cyan-950">
        <a href="{{ route('home') }}" class="font-bold px-8 border-r border-gray-400">Home</a>
        <a href="{{ route('courses.index') }}" class="px-4 border-r border-gray-400">Courses</a>
        <a href="#" class="px-4 border-r border-gray-400">Mainframe Access</a>
        <a href="{{ route('dashboard') }}" class="px-4">Dashboard</a>
    </nav>
    @guest
        <a href="{{ route('login') }}" class="bg-cyan-950 text-white px-4 py-2 rounded cursor-pointer mr-4">Login</a>
        <a href="{{ route('register') }}" class="bg-cyan-950 text-white px-4 py-2 rounded cursor-pointer">Register</a>
    @else
        <form id="logout-form" action="{{ route('logout') }}" method="POST" style="display: none;">
            @csrf
        </form>
        <a href="#" onclick="event.preventDefault(); document.getElementById('logout-form').submit();" class="bg-cyan-950 text-white px-4 py-2 rounded cursor-pointer">Logout</a>
    @endguest

</header>
<main>
    @yield('content')
</main>
<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
</body>
</html>

