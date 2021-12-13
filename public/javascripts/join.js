document.getElementById('user-form').addEventListener('submit', async(e) => {
    e.preventDefault();
    const user_id = e.target.user_id.value;
    const user_pwd = e.target.user_pwd.value;
    const user_pwd_confirm = e.target.user_pwd_confirm.value;
    const user_email = e.target.user_email.value;
    const user_nickname = e.target.user_nickname.value;
    const user_phone = e.target.user_phone.value;
    const checkbox = document.getElementById('checkbox').checked;
    const bizz_license = e.target.bizz_license.value;

    if (!user_id) {
        return alert('아이디를 입력하세요');
    }
    if (!user_pwd || !user_pwd_confirm) {
        return alert('비밀번호를 입력하세요');
    }
    if (!user_email) {
        return alert('이메일을 입력하세요');
    }
    if (!user_nickname) {
        return alert('닉네임을 입력하세요');
    }
    if (user_pwd !== user_pwd_confirm) {
        return alert('비밀번호가 일치하지 않습니다');
    }
    if (!checkbox) {
        return alert('개인정보 이용약관에 동의해주세요');
    }

    // 값 유효 체크
    var idExp = /^[a-z]+[a-z0-9_]{5,19}$/g;
    if (!idExp.test(user_id)) {
        console.log(idExp.test(user_id));
        return alert('아이디가 형식에 맞지 않습니다\n영문, 숫자로 구성된 6~20자');
    }
    var pwdExp = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[$`~!@#$%^&*?\\(\\)\-_=+]).{8,16}$/;
    if (!pwdExp.test(user_pwd)) {
        return alert('비밀번호가 형식에 맞지 않습니다\n영문, 숫자, 특문으로 구성된 8~16자');
    }
    var nickExp = /^[a-zA-Zㄱ-힣0-9][a-zA-Zㄱ-힣0-9]{1,9}$/;
    if (!nickExp.test(user_nickname)) {
        return alert('닉네임이 형식에 맞지 않습니다\n한글, 영문, 숫자로 구성된 2~10자');
    }
    var emailExp = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
    if (!emailExp.test(user_email)) {
        return alert('이메일이 형식에 맞지 않습니다');
    }

    $.ajax({
        type: 'POST',
        url: '/auth/join',
        data: {
            'user_id': user_id,
            'user_pwd': user_pwd,
            'user_email': user_email,
            'user_nickname': user_nickname,
            'user_phone': user_phone,
            'bizz_license': bizz_license,
        },
        dataType: 'json',
        success: function(response) {
            alert(response.message);
            window.location.href = '/login';
        },
        error: function (request, status, error) {
            alert(error);
        }
    });

    // try {
    //     await axios.post('/auth/join', { user_id, user_pwd, user_email, user_nickname, user_phone });
    // } catch (err) {
    //     console.error(err);
    // }
});