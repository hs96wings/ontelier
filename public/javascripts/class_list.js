
        let appendNumber = 10;
        let prependNumber = 1;
        const swiper = new Swiper('.swiper', {
          slidesPerView: 4,
          centeredSlides: false,
          spaceBetween: 20,
          pagination: {
            el: '.swiper-pagination',
            type: 'fraction',
          },
          navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          },
          virtual: {
            slides: (function () {
              const classes = [];
              for (var i = 0; i < 10; i += 1) {
                  classes.push(`<img class="class-thumbnail" src="/images/${i*2+70}.png">`);

              }
              return classes;
            })(),
          },
        });
  