import './bootstrap';
import '@fortawesome/fontawesome-free/js/all.js';

import Alpine from 'alpinejs';

window.Alpine = Alpine;

Alpine.start();

const swiper = new Swiper('.swiper', {
    loop: true,
    autoplay: {
        delay: 5000,
    },
    speed: 1000,
    slidesPerView: 2,
    spaceBetween: 100,
    grid: {
        rows: 1,
    },
    mousewheel: {
        forceToAxis: true,
    },
});

// const mySwiper = new Swiper('.mySwiper', {
//     loop: true,
//     autoplay: {
//         delay: 5000,
//     },
//     speed: 1000,
//     slidesPerView: 1,
//     spaceBetween: 100,
//     grid: {
//         rows: 1,
//     },
//     mousewheel: {
//         forceToAxis: true,
//     },
// });
