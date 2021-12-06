document.getElementById('user-form').addEventListener('submit', async(e) => {
    e.preventDefault();
    const user_email = e.target.user_email.value;

    if (!user_email) {
        return alert('이메일을 입력하세요');
    }

    // 값 유효 체크
    var emailExp = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
    if (!emailExp.test(user_email)) {
        return alert('이메일을 확인해주세요');
    }

    $.ajax({
        type: 'POST',
        url: '/auth/reset',
        data: {
            'user_email': user_email,
        },
        dataType: 'json',
        success: function(response) {
            alert(response.message);
            window.location.href = '/';
        },
        error: function (request, status, error) {
            alert(error);
        }
    });
});