document.getElementById('user-form').addEventListener('submit', async(e) => {
    e.preventDefault();
    const user_pwd = e.target.user_pwd.value;
    const user_pwd_confirm = e.target.user_pwd_confirm.value;
    const user_email = document.getElementById('user_email').value;
    console.log(user_email);

    if (!user_pwd || !user_pwd_confirm) {
        return alert('비밀번호를 입력하세요');
    }
    if (user_pwd !== user_pwd_confirm) {
        return alert('비밀번호가 일치하지 않습니다');
    }

    // 값 유효 체크
    var pwdExp = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[$`~!@#$%^&*?\\(\\)\-_=+]).{8,16}$/;
    if (!pwdExp.test(user_pwd)) {
        return alert('비밀번호를 확인해주세요');
    }

    $.ajax({
        type: 'POST',
        url: '/auth/resetPwd',
        data: {
            'user_pwd': user_pwd,
            'user_email': user_email,
        },
        dataType: 'json',
        success: function(response) {
            alert(response.message);
            window.location.href = '/login';
        },
        error: function (request, status, error) {
            alert(error);
            window.location.href = '/';
        }
    });

    // try {
    //     await axios.post('/auth/join', { user_id, user_pwd, user_email, user_nickname, user_phone });
    // } catch (err) {
    //     console.error(err);
    // }
});