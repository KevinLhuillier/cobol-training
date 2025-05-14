@extends('layout')
@section('content')
    {{--    Call to action--}}
    <div class="bg-dark-pattern cta-section text-white py-40 px-80">
        <div class="container mx-auto grid grid-cols-2 items-center">
            <div>
                <h1 class="text-5xl font-bold mb-4">Join Our <span id="dynamic-word" class="text-cyan-500">Cobol</span> School</h1>
                <p class="text-xl mb-10">The only place to learn and practice mainframe skills. Donec sagittist, tellus ac imperdiet feugiat, erat ex
                    pellentesque nulla, ut posuere tortor magna ac risus.</p>
                <a href="{{ route('courses.index') }}" class="bg-cyan-500 text-white text-lg px-10 py-3 rounded">Discover</a>
            </div>
            <div class="relative">
                <img src="/images/cobol2.webp" alt="Dinosaur Cartoon" class="absolute right-0 top-1/2 transform -translate-y-1/2 w-2/4">
            </div>
        </div>
    </div>

    {{--    Offer and Course Features--}}
    <div class="bg-light-pattern">
        <div class="container mx-auto grid grid-cols-3 gap-16 py-20 px-40 text-center">
            <div class="col-span-1 bg-gray-800 text-white rounded-lg border-2 border-cyan-500">
                <p class="text-white text-base font-semibold bg-cyan-500 py-2 mb-8"><i class="fa-solid fa-star"></i> GO PREMIUM</p>
                <h2 class="text-3xl font-bold mb-4">All <span class="text-cyan-500">Access</span> Pass</h2>
                <p class="text-base mb-8 mt-1">Everything you need to get skilled</p>
                <p class="text-cyan-500 text-8xl mb-6">49<span class="text-6xl">€</span><span class="text-xl text-white"> /mo</span></p>
                <p class="inline-block text-sm border-b-2 border-dotted mb-2">Mainframe Access 24/7</p><br>
                <p class="inline-block text-sm border-b-2 border-dotted mb-12">Unlock all the Courses</p><br>
                <div class="mb-8"><a href="{{ route('courses.index') }}" class="bg-cyan-500 text-white text-lg px-10 py-3 rounded">Get Access</a></div>
            </div>
            <div class="col-span-2 text-gray-900 p-8">
                <h2 class="text-4xl font-bold mb-4">Course Features</h2>
                <p class="text-xl mb-6">Learn from the best instructors and improve your skills with our comprehensive courses.</p>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div class="border-dotted border-2 border-cyan-500 p-4 text-center rounded-lg">
                        <i class="fa-solid fa-book text-cyan-500 text-4xl mb-2"></i>
                        <h3 class="text-xl font-semibold">Detailed course content</h3>
                    </div>
                    <div class="border-dotted border-2 border-cyan-500 p-4 text-center rounded-lg">
                        <i class="fa-solid fa-chalkboard-teacher text-cyan-500 text-4xl mb-2"></i>
                        <h3 class="text-xl font-semibold">Interactive sessions</h3>
                    </div>
                    <div class="border-dotted border-2 border-cyan-500 p-4 text-center rounded-lg">
                        <i class="fa-solid fa-certificate text-cyan-500 text-4xl mb-2"></i>
                        <h3 class="text-xl font-semibold">Certification upon completion</h3>
                    </div>
                    <div class="border-dotted border-2 border-cyan-500 p-4 text-center rounded-lg">
                        <i class="fa-solid fa-laptop-code text-cyan-500 text-4xl mb-2"></i>
                        <h3 class="text-xl font-semibold">Hands-on projects</h3>
                    </div>
                    <div class="border-dotted border-2 border-cyan-500 p-4 text-center rounded-lg">
                        <i class="fa-solid fa-users text-cyan-500 text-4xl mb-2"></i>
                        <h3 class="text-xl font-semibold">Community support</h3>
                    </div>
                    <div class="border-dotted border-2 border-cyan-500 p-4 text-center rounded-lg">
                        <i class="fa-solid fa-graduation-cap text-cyan-500 text-4xl mb-2"></i>
                        <h3 class="text-xl font-semibold">Expert instructors</h3>
                    </div>
                </div>
                <a href="{{ route('courses.index') }}" class="bg-cyan-500 text-white text-lg px-10 py-3 rounded">Explore Features</a>
            </div>
        </div>
    </div>

    {{--    Testimonials Section--}}
    <div class="bg-dark-pattern text-white py-20 px-80">
        <div class="container mx-auto text-center">
            <h2 class="text-4xl font-bold mb-4">What Our Students Say</h2>
            <p class="text-xl mb-10">Hear from our students about their learning experiences.</p>
            <div class="swiper">
                <div class="swiper-wrapper">
                    <div class="swiper-slide border-dotted border-2 border-cyan-500 p-4 text-center rounded-lg">
                        <p class="text-lg italic mb-4">"The courses are very detailed and the instructors are amazing!"</p>
                        <h3 class="text-xl font-semibold">John Doe</h3>
                    </div>
                    <div class="swiper-slide border-dotted border-2 border-cyan-500 p-4 text-center rounded-lg">
                        <p class="text-lg italic mb-4">"I love the interactive sessions and hands-on projects."</p>
                        <h3 class="text-xl font-semibold">Jane Smith</h3>
                    </div>
                    <div class="swiper-slide border-dotted border-2 border-cyan-500 p-4 text-center rounded-lg">
                        <p class="text-lg italic mb-4">"The community support is fantastic and very helpful."</p>
                        <h3 class="text-xl font-semibold">Alice Johnson</h3>
                    </div>
                    <div class="swiper-slide border-dotted border-2 border-cyan-500 p-4 text-center rounded-lg">
                        <p class="text-lg italic mb-4">"The community support OK."</p>
                        <h3 class="text-xl font-semibold">John Johnson</h3>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{--    Courses List Section--}}
    <div class="bg-white py-20 px-80">
        <div class="container mx-auto text-center">
            <h2 class="text-4xl font-bold mb-4">Our Courses</h2>
            <p class="text-xl mb-10">Explore our wide range of courses designed to help you master mainframe skills.</p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                @foreach($courses as $course)
                    <div class="bg-gray-800 text-white border-2 border-cyan-500 p-8 text-center rounded-lg">
                        <h3 class="text-xl font-semibold mb-2">{{ $course->title }}</h3>
                        <p class="text-base mb-8">{{ $course->description }}</p>
                        <a href="{{ route('courses.show', $course->id) }}" class="bg-cyan-500 text-white text-lg px-10 py-3 rounded">Learn More</a>
                    </div>
                @endforeach
            </div>
        </div>
    </div>

    {{--    Image Grid Section--}}
    <div class="bg-gray-100 py-20 px-80">
        <div class="container mx-auto text-center">
            <h2 class="text-4xl font-bold mb-4">Gallery</h2>
            <p class="text-xl mb-10">Take a look at our gallery of images.</p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div><img src="/images/image1.jpg" alt="Image 1" class="w-full h-auto max-w-xs max-h-64 rounded-lg mx-auto" onclick="openModal(this)"></div>
                <div><img src="/images/image1.jpg" alt="Image 1" class="w-full h-auto max-w-xs max-h-64 rounded-lg mx-auto" onclick="openModal(this)"></div>
                <div><img src="/images/image1.jpg" alt="Image 1" class="w-full h-auto max-w-xs max-h-64 rounded-lg mx-auto" onclick="openModal(this)"></div>
                <!-- Ajoutez plus d'images ici -->
            </div>
        </div>
    </div>

    {{--    Image Popup Modal--}}
    <div id="imageModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center hidden">
        <span class="absolute top-4 right-4 text-white text-3xl cursor-pointer" onclick="closeModal()">&times;</span>
        <img id="modalImage" src="" alt="Enlarged Image" class="max-w-full max-h-full rounded-lg">
    </div>

    <script>
        function openModal(image) {
            const modal = document.getElementById('imageModal');
            const modalImage = document.getElementById('modalImage');
            modalImage.src = image.src;
            modal.classList.remove('hidden');
        }

        function closeModal() {
            const modal = document.getElementById('imageModal');
            modal.classList.add('hidden');
        }
    </script>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const words = ['Cobol', 'JCL', 'DB2', 'CICS'];
            let index = 0;
            const element = document.getElementById('dynamic-word');

            setInterval(() => {
                element.classList.add('fade-out');
                setTimeout(() => {
                    index = (index + 1) % words.length;
                    element.textContent = words[index];
                    element.classList.remove('fade-out');
                    element.classList.add('fade-in');
                    setTimeout(() => {
                        element.classList.remove('fade-in');
                    }, 500); // Corresponds to the duration of the fade-in transition
                }, 500); // Corresponds to the duration of the fade-out transition
            }, 4000); // Change word every 2 seconds
        });
    </script>

@endsection
