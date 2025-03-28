@extends('layout')
@section('content')
    <h1>{{ $course->title }}</h1>
    <p>{{ $course->description }}</p>
    <h2>Chapters</h2>
    <ul>
        @foreach($course->sections as $section)
            <li>
                {{ $section->title }}
                <ul>
                    @foreach($section->lessons as $lesson)
                        <li>{{ $lesson->title }}</li>
                    @endforeach
                </ul>
            </li>
        @endforeach
    </ul>

    @auth
        @if(Auth::user()->isEnrolledIn($course))
            <a href="{{ route('learn.continue', $course->id) }}" class="btn btn-primary">Continue</a>
        @else
            @if($course->price > 0)
                <a href="{{ route('purchase', $course->id) }}" class="btn btn-primary">Purchase</a>
            @else
                <form action="{{ route('enroll', $course->id) }}" method="POST">
                    @csrf
                    <button type="submit" class="btn btn-primary">Enroll</button>
                </form>
            @endif
        @endif
    @else
        <p>Please <a href="{{ route('login') }}">login</a> to enroll or purchase this course.</p>
    @endauth

@endsection
