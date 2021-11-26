// 도움이 됐어요
function thumbsUp(classId, id) {
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
}
