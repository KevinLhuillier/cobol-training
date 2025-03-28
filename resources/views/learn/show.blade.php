@extends('layout')
@section('content')
    <div class="pt-8 flex">
        <aside class="w-1/4 p-4  border-r border-gray-300">
            <div class="mb-4">
                <div class="bg-gray-200 rounded-full h-2.5 mb-2">
                    <div class="bg-cyan-500 h-2.5 rounded-full" style="width: {{ $progress }}%;"></div>
{{--                    <div class="bg-gray-800 h-2.5 rounded-full" style="width: 10%;"></div>--}}
                </div>
                <span class="text-sm font-medium">{{ $progress }}% Complete</span>
{{--                <span class="text-sm font-medium">10% Complete</span>--}}
            </div>
            <h1 class="text-xl font-bold mb-4">{{ $course->title }}</h1>
            <h2 class="text-lg font-semibold mb-2">Sections</h2>
            <ul>
                @foreach($course->sections as $section)
                    <li class="mb-2">
                        <div class="flex items-center justify-between cursor-pointer" onclick="toggleSection({{ $section->id }})">
                            <span class="font-semibold">{{ $section->title }}</span>
                            <i id="arrow-{{ $section->id }}" class="fa fa-chevron-up"></i>
                        </div>
                        <ul id="section-{{ $section->id }}" class="ml-4">
                            @foreach($section->lessons as $lessonItem)
                                <li class="mb-1 p-2 border-b border-gray-300 {{ $lessonItem->id == $lesson->id ? 'bg-cyan-500 text-white rounded' : 'text-gray-800' }}">
                                    @if($lessonItem->isWatchedByUser(Auth::id()))
                                        <i class=" mr-2 fa-solid fa-square-check text-gray-800"></i>
                                    @endif
                                        <a href="{{ route('learn.show', [$course->id, $section->id, $lessonItem->id]) }}" class="hover:underline">{{ $lessonItem->title }}</a>
                                </li>
                            @endforeach
                        </ul>
                    </li>
                @endforeach
            </ul>
        </aside>
        <section class="w-3/4 p-24 flex flex-col items-center">
            <h2 class="text-xl font-bold mb-4">{{ $lesson->title }}</h2>
            <div class="w-full mb-4">
                <iframe width="100%" height="600" src="{{ $lesson->url }}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
            <div class="flex space-x-4">
                <a href="#" class="btn btn-secondary bg-gray-200 text-gray-700 px-4 py-2 rounded">Previous</a>
                <form method="POST" action="{{ route('learn.markAsWatched', $lesson->id) }}">
                    @csrf
                    <button type="submit" class="btn btn-primary bg-cyan-500 text-white px-4 py-2 rounded">Mark as Watched</button>
                </form>
                <a href="#" class="btn btn-secondary bg-gray-200 text-gray-700 px-4 py-2 rounded">Next</a>
            </div>
        </section>
    </div>

    <script>
        function toggleSection(sectionId) {
            const section = document.getElementById(`section-${sectionId}`);
            const arrow = document.getElementById(`arrow-${sectionId}`);
            if (section.classList.contains('hidden')) {
                section.classList.remove('hidden');
                arrow.classList.remove('fa-chevron-down');
                arrow.classList.add('fa-chevron-up');
            } else {
                section.classList.add('hidden');
                arrow.classList.remove('fa-chevron-up');
                arrow.classList.add('fa-chevron-down');
            }
        }
    </script>
@endsection
