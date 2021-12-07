function parseThumbsUp() {
  var mydata = "";
  $.ajax({
        type : "GET",
        url : `/mypage/thumbsup`,
        dataType : "json",
        async: false,
        error : function(request, status, error){
            console.log(error);
        },
        success : function(Thumb_data){

          mydata = Thumb_data.Thumbs_data.map(a => a.ReviewId); // 받아온 좋아요 id 데이터

          console.log(mydata);
          }
    });

    return mydata;
}

// 도움이 됐어요
function thumbsUp(classId, id, userId) {

  // 로그인 되어있을 시에만
  if (userId != undefined) {
    $.ajax({
      type: "POST",
      url: `/class/${classId}/review/like`,
      data: {
        'ClassId': classId, // 강의 번호
        'id': id // 후기 번호
      },
      dataType: "json",
      success: function(response) {
        console.log(response.message);
        if ($(`#review_id${id} #like-cnt`).attr("class") == "unchecked") { // 클래스명이 unchecked 일 시
          $(`#review_id${id} .thumbsup-text img`).replaceWith(`<img src="/images/thumbs-up-click.png">`); // 이미지 변경
          $(`#review_id${id} #like-cnt`).attr("class", "checked"); // 클래스명 checked로 변경
        } else {
          $(`#review_id${id} .thumbsup-text img`).replaceWith(`<img src="/images/thumbs-up.png">`); // 이미지 변경
          $(`#review_id${id} #like-cnt`).attr("class", "unchecked"); // 클래스명 unchecked로 변경
        }
        $(`#review_id${id} #thumbsup-num`).html(response.num); // 서버로부터 변경된 값 받아서 넣기
      },
      error: function (request, status, error) {
        alert(error);
      },
    });

  } else {
    alert("로그인 후에 이용할 수 있습니다.");
    window.location.href = "/login";
  }

}

// 도움이 됐어요 눌려있도록
function ReadyThumbsUp(id, mydata) {

    for (var i = 0; i < mydata.length; i++) {
      if (mydata[i] == id) {
        // 유저 찜목록에 이 클래스가 있으면
          $(`#review_id${id} .thumbsup-text #like-cnt`).attr("class", "checked"); // 클래스명 checked로 변경
          $(`#review_id${id} .thumbsup-text #like-cnt .like-btn`).attr("src", "/images/thumbs-up-click.png"); // 이미지 변경
      }
    }

}
