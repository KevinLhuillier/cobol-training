@extends('layout')
@section('content')
    <h1>Our Courses</h1>
    <ul>
        @foreach($courses as $course)
            <li><a href="{{ route('courses.show', $course->id) }}">{{ $course->title }}</a></li>
        @endforeach
    </ul>
@endsection
