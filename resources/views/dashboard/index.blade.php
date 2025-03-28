@extends('layout')
@section('content')
    <div class="container mx-auto py-8">
        <h1 class="text-3xl font-bold mb-6">Dashboard</h1>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="bg-white shadow-md rounded-lg p-6">
                <h2 class="text-xl font-semibold mb-4">Profile</h2>
                <p class="text-gray-700">User: {{ $user->name }}</p>
                <p class="text-gray-700">Plan: Basic</p>
            </div>

            <div class="bg-white shadow-md rounded-lg p-6">
                <h2 class="text-xl font-semibold mb-4">Enrolled Courses</h2>
                <ul class="list-disc pl-5 text-gray-700">
                    @foreach($enrolledCourses as $course)
                        <li>{{ $course->title }}</li>
                    @endforeach
                </ul>
            </div>

            <div class="bg-white shadow-md rounded-lg p-6">
                <h2 class="text-xl font-semibold mb-4">Recent Courses</h2>
                @if($recentCourse)
                    <ul class="list-disc pl-5 text-gray-700">
                        <li>
                            {{ $recentCourse->title }}
                            <a href="{{ route('learn.continue', $recentCourse->id) }}" class="text-cyan-500 ml-2">Continue</a>
                        </li>
                    </ul>
                @else
                    <p class="text-gray-700">No recent courses</p>
                @endif
            </div>
        </div>

        <div class="mt-6">
            <a href="{{ route('profile.edit', $user->id) }}" class="bg-cyan-500 text-white text-lg px-10 py-3 rounded hover:bg-cyan-600 transition duration-300">Go to Profile</a>
        </div>
    </div>
@endsection
