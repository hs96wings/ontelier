// $(function() {
//
//   $('li').click(function() {
//     $('li').removeClass()
//       $(this).addClass('on')
//   })
// })

$(document).ready(function($) {

        $(".class_nav li").click(function(event){

                event.preventDefault();
                var top = $($(this).attr("data-target")).offset().top - 110;

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
            targetTop = $target.offset().top - 110;

        if (targetTop <= scltop) {
            $menu.removeClass('on');
            $menu.eq(idx).addClass('on');
        }
        if (!(200 <= scltop)) {
            $menu.removeClass('on');
        }
    })

});
