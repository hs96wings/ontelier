document.getElementById('user-form').addEventListener('submit', async(e) => {
    e.preventDefault();
    const user_id = e.target.user_id.value;
    const user_pwd = e.target.user_pwd.value;
    const user_pwd_confirm = e.target.user_pwd_confirm.value;
    const user_email = e.target.user_email.value;
    const user_nickname = e.target.user_nickname.value;
    const user_phone = e.target.user_phone.value;

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

    try {
        await axios.post('/auth/join', { user_id, user_pwd, user_email, user_nickname, user_phone });
    } catch (err) {
        console.error(err);
    }
    window.location.href = '/';
});