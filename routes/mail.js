const nodemailer = require('nodemailer');

const mailSender = {
    // 메일 발송 함수
    sendGmail: function(param) {
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            host: 'smtp.gmlail.com',
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.NODEMAILER_USER,
                pass: process.env.NODEMAILER_PASS
            }
        });

        // 메일 옵션
        var mailOptions = {
            from: transporter.user, // 보내는 메일의 주소
            to: param.toEmail, // 수신할 이메일
            subject: param.subject, // 메일 제목
            text: param.text // 메일 내용
        };

        // 메일 발송
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.error(error);
            } else {
                console.log('Email sent:' + info.response);
            }
        })  ;
    }
}

module.exports = mailSender;