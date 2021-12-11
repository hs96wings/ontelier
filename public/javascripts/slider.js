$(function(){

  $('.autoplay').slick({
  	slide: 'div',		//슬라이드 되어야 할 태그 ex) div, li
  	infinite : true, 	//무한 반복 옵션
  	slidesToShow : 1,		// 한 화면에 보여질 컨텐츠 개수
  	slidesToScroll : 1,		//스크롤 한번에 움직일 컨텐츠 개수
  	speed : 500,	 // 다음 버튼 누르고 다음 화면 뜨는데까지 걸리는 시간(ms)
  	arrows : true, 		// 옆으로 이동하는 화살표 표시 여부
  	dots : true, 		// 스크롤바 아래 점으로 페이지네이션 여부
  	autoplay : true,			// 자동 스크롤 사용 여부
  	autoplaySpeed : 5000, 		// 자동 스크롤 시 다음으로 넘어가는데 걸리는 시간 (ms)
  	pauseOnHover : true,		// 슬라이드 이동	시 마우스 호버하면 슬라이더 멈추게 설정
  	vertical : false,		// 세로 방향 슬라이드 옵션
  	prevArrow : "<button type='button' class='slick-prev'>Previous</button>",		// 이전 화살표 모양 설정
  	nextArrow : "<button type='button' class='slick-next'>Next</button>",		// 다음 화살표 모양 설정
  	dotsClass : "slick-dots", 	//아래 나오는 페이지네이션(점) css class 지정
  	draggable : true, 	//드래그 가능 여부

  	responsive: [ // 반응형 웹 구현 옵션
  		{
  			breakpoint: 960, //화면 사이즈 960px
  			settings: {
  				//위에 옵션이 디폴트 , 여기에 추가하면 그걸로 변경
  				slidesToShow:1
  			}
  		},
  		{
  			breakpoint: 768, //화면 사이즈 768px
  			settings: {
  				//위에 옵션이 디폴트 , 여기에 추가하면 그걸로 변경
  				slidesToShow:1
  			}
  		}
  	]

  });

  $('.slide').slick({
  	slide: 'div',		//슬라이드 되어야 할 태그 ex) div, li
  	infinite : false, 	//무한 반복 옵션
  	slidesToShow : 6,		// 한 화면에 보여질 컨텐츠 개수
  	slidesToScroll : 1,		//스크롤 한번에 움직일 컨텐츠 개수
  	speed : 240,	 // 다음 버튼 누르고 다음 화면 뜨는데까지 걸리는 시간(ms)
  	arrows : true, 		// 옆으로 이동하는 화살표 표시 여부
  	dots : true, 		// 스크롤바 아래 점으로 페이지네이션 여부
  	autoplay : false,			// 자동 스크롤 사용 여부
  	autoplaySpeed : 5000, 		// 자동 스크롤 시 다음으로 넘어가는데 걸리는 시간 (ms)
  	pauseOnHover : true,		// 슬라이드 이동	시 마우스 호버하면 슬라이더 멈추게 설정
  	vertical : false,		// 세로 방향 슬라이드 옵션
  	prevArrow : "<button type='button' class='slick-prev'>Previous</button>",		// 이전 화살표 모양 설정
  	nextArrow : "<button type='button' class='category-next'><img src='/images/next.png'></button>",		// 다음 화살표 모양 설정
  	dots : false, 	//아래 나오는 페이지네이션(점) css class 지정
  	draggable : true, 	//드래그 가능 여부
    touchThreshold : 15, // 너비의 1/n 이상을 스와이프해야 넘겨짐
    swipeToSlide : true,
    edgeFriction : 0.1,
    easing: 'ease-out',

  	responsive: [ // 반응형 웹 구현 옵션
  		{
  			breakpoint: 1200, //화면 사이즈 1024px
  			settings: {
  				//위에 옵션이 디폴트 , 여기에 추가하면 그걸로 변경
  				slidesToShow:6
  			}
  		},
  		{
  			breakpoint: 900, //화면 사이즈 768px
  			settings: {
  				//위에 옵션이 디폴트 , 여기에 추가하면 그걸로 변경
  				slidesToShow:5
  			}
  		}
  	]

  });

  // $('#slider-div').slick("unslick");
  // $('.slide').slick("unslick");

})

// $(function() {
//   $('.slide .slick-track').on({
//
//   })
// })
//   var transformX = parseInt( $('.slide .slick-track').css('transform').split('(')[1].split(')')[0].split(',')[4].replace(' ', '') );
//   console.log(transformX);
//
//   if ( transformX > 10) {
//     console.log('ㅁ');
//   }
