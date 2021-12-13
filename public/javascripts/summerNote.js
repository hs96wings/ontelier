// 썸머노트 실행 스크립트

  $('.summernote').summernote({
		height: 600,
		width : 1000,
		minHeight: null,
		maxHeight: null,
		focus: true,
		lang: "ko-KR",
		callbacks: {
			onImageUpload : function(files){
				sendFile(files[0],this);
			}
		}

	});

  function sendFile(file, editor){
  var data = new FormData();
  data.append("file", file);
  console.log(file);
  $.ajax({
    data : data,
    type : "POST",
    url : "SummerNoteImageFile",
    contentType : false,
    processData : false,
    success : function(data){
      console.log(data);
      console.log(editor);
      $(editor).summernote("insertImage",data.url);
    }
  });
}


  // 서머노트에 text 쓰기
  $('.summernote').summernote('insertText', '내용입력');


  // 서머노트 쓰기 비활성화
  $('.summernote').summernote('disable');

  // 서머노트 쓰기 활성화
  $('.summernote').summernote('enable');


  // 서머노트 리셋
  $('.summernote').summernote('reset');


  // 마지막으로 한 행동 취소 ( 뒤로가기 )
  $('.summernote').summernote('undo');
  // 앞으로가기
  $('.summernote').summernote('redo');
