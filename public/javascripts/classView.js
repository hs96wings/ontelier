$(function() {
  //
  // $(".category-list li").click(function() {
  //     $(".category-list li").removeClass()
  //       $(this).addClass("on");
  // })
  var tabBtn = $(".category-list > li");     //각각의 버튼을 변수에 저장


  tabBtn.click(function(){
    var target = $(this);         //버튼의 타겟(순서)을 변수에 저장
    var index = target.index();   //버튼의 순서를 변수에 저장
    tabBtn.removeClass("on");    //버튼의 클래스를 삭제
    target.addClass("on");       //타겟의 클래스를 추가
  });
});

$(document).ready(function($) {

        $(".class_nav li").click(function(event){

                event.preventDefault();
                var top = $($(this).attr("data-target")).offset().top - 115;

                $('html,body').animate({scrollTop: top}, 300);

        });

});

$(window).scroll(function(){
    var $menu = $('li');
    var $contents = $('.scroll');
    var scltop = $(window).scrollTop();

    $.each($('.scroll'), function(idx, item){
        var $target   = $contents.eq(idx),
            i         = $target.index(),
            targetTop = $target.offset().top - 120;

        if (targetTop <= scltop) {
            $menu.removeClass('on');
            $menu.eq(idx).addClass('on');
        }
        if (!(200 <= scltop)) {
            $menu.removeClass('on');
        }
    })

});
