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
        $(`#review_id${id} .thumbsup-text img`).replaceWith(`<img src="/images/thumbs-up-click.png">`) // 이미지 변경
        $(`#review_id${id} #thumbsup-num`).replaceWith(`<span id="thumbsup-num>${response.num}</span>"`); // 서버로부터 1 증가된 값 받아서 넣기
      },
      error: function (request, status, error) {
        alert(error);
      },
    });
}
