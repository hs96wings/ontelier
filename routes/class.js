const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const sequelize = require('sequelize');

const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const User = require('../models/user');
const Class = require('../models/class');
const Review = require('../models/review');
const Purchase = require('../models/purchase');
const Wishlist = require('../models/wishlist');
const Thumbsup = require('../models/thumbsup');

const router = express.Router();

try {
    fs.readdirSync('./public/images/uploads');
} catch (error) {
    console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다');
    fs.mkdirSync('./public/images/uploads')
}

const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            cb(null, './public/images/uploads/');
        },
        filename(req, file, cb) {
            const ext = path.extname(file.originalname);
            cb(null, req.user.user_nickname + '_' + Date.now() + ext);
        },
    }),
    fileFilter: function (req, file, cb) {
        var ext = path.extname(file.originalname);
        if (ext !== '.png' && ext !== '.jpeg' && ext !== '.jpg' && ext !== '.gif') {
            req.flash('error', '클래스는 등록되었으나 이미지는 등록되지 않았습니다');
            cb(null, false);
        } else {
            cb(null, true);
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 },
});


router.get('/:id', async (req, res, next) => {
    let result = await Class.findOne({
        where: { id: req.params.id }
    });
    let reviews = await Review.findAll({
        where: { ClassId: req.params.id }
    });
    let wishlist = await Wishlist.findAndCountAll({
        include: {
            model: Class,
            where: {
                'id': req.params.id
            }
        }
    });
    let userWish;
    if (req.user && req.user.user_id) {
        userWish = await Wishlist.findOne({
            where: {
                ClassId: req.params.id,
                UserUserId: req.user.user_id,
            }
        });
        if (!userWish) userWish = null;
    } else {
        userWish = null;
    }
    if (result) {
        res.render('class_view', {
            class: result,
            reviews,
            wishlist_num: wishlist.count,
            userWish,
        });
    } else {
        req.flash('error', '없는 강의입니다');
        res.redirect('/');
    }
});

router.get('/:id/review', async (req, res, next) => {
    let result = await Review.findAll({
        where: { ClassId: req.params.id },
        include: {
            model: Class,
            attributes: ['class_title'],
        },
        include: {
            model: User,
            attributes: ['user_id', 'user_email', 'user_nickname', 'user_profile_url']
        },
    });
    let isThumbs = await Thumbsup.findAll({
        where: {
            UserUserId: req.user.user_id
        }
    });
    if (result) {
        res.render('class_review', {
            reviews: result,
        });
    } else {
        req.flash('error', 'DB 오류');
        res.redirect('/');
    }
});

router.get('/:id/review/write', isLoggedIn, async (req, res, next) => {
    let result;
    result = await Class.findOne({
        where: {
            id: req.params.id
        },
        attributes: ['id']
    });

    if (result) {
        res.render('class_review_write', {
            result: result,
        });
    } else {
        req.flash('오류');
        res.redirect('/mypage');
    }
});

router.post('/review/write', isLoggedIn, upload.single('review_img'), async (req, res) => {
    let filename;

    if (req.file === undefined) {
        filename = '';
    } else {
        filename = `/images/uploads/${req.file.filename}`;
    }
    try {
        await Review.create({
            review_score: req.body.review_score,
            review_img: filename,
            review_text: req.body.review_text,
            review_best_num: req.body.review_best_num,
            reviewer: req.user.user_nickname,
            ClassId: req.body.class_id,
            UserUserId: req.user.user_id,
        });

        let url = '/class/' + req.body.class_id + '/review';
        res.redirect(url);
    } catch (error) {
        req.flash('error', '오류로 인해 업로드 되지 않았습니다');
    }
});

router.get('/:id/payment', isLoggedIn, async (req, res, next) => {
    const isPurchase = await Purchase.findOne({
        where: {
            UserUserId: req.user.user_id,
            ClassId: req.params.id,
        }
    });

    if (isPurchase) {
        req.flash('error', '이미 구매한 강의입니다');
        res.redirect('/');
    } else {
        const payClass = await Class.findOne({
            where: { id: req.params.id }
        });
        if (payClass) {
            res.render('class_payment', {
                class: payClass
            });
        } else {
            req.flash('error', '오류가 발생했습니다');
            res.redirect('/');
        }
    }
});

router.post('/:id/payment/complete', async (req, res) => {
    try {
        // 결제 번호, 주문 번호 추출
        const { imp_uid, merchant_uid } = req.body;
        // 결제 정보 조회하기
        // 액세스 토큰(access token) 발급 받기
        const getToken = await axios({
            url: "https://api.iamport.kr/users/getToken",
            method: "post",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            data: {
                imp_key: process.env.IAMPORT_ID,
                imp_secret: process.env.IAMPORT_SECRET,
            }
        });
        const { access_token } = getToken.data.response; // 인증 토큰

        // imp_uid로 아임포트 서버에서 결제 정보 조회
        const getPaymentData = await axios({
            url: `https://api.iamport.kr/payments/${imp_uid}`,
            method: "GET",
            headers: { "Authorization": access_token }
        });
        const paymentData = getPaymentData.data.response;

        // 금액 조회
        const order = await Class.findOne({ where: { id: req.params.id } });
        const price = order.class_price;
        const discount = order.class_discount;
        const amountToBePaid = price - (price * discount / 100);

        // 결제 검증
        const { amount, status } = paymentData;
        // 결제금액 일치
        if (amount === amountToBePaid) {
            await Purchase.create({
                ClassId: req.params.id,
                UserUserId: req.user.user_id,
                merchant_uid,
            });

            // 결제 완료
            switch (status) {
                // 무통장 입금?
                case 'ready':
                    const { vbank_num, vbank_date, vbank_name } = paymentData;
                    // await Bank.create
                    res.send({ status: 'vbankIssued', message: '가상계좌 발급 성공' });
                    break;
                // 결제 완료
                case 'paid':
                    res.send({ status: 'success', message: '결제 성공' });
                    break;
            }
        } else {
            throw { status: 'forgery', message: '위조된 결제시도' };
        }
    } catch (e) {
        res.status(400).send(e);
    }
});

router.get('/contents/:id', async (req, res, next) => {
    const isPurchase = await Purchase.findOne({
        where: {
            UserUserId: req.user.user_id,
            ClassId: req.params.id,
        }
    })
    if (isPurchase) {
        const isClass = await Class.findOne({
            where: {
                id: req.params.id,
            }
        });
        if (isClass) {
            // let result = await Lecture.findAll({
            //     where: {
            //         ClassId: req.params.id,
            //     }
            // });
            result = null;
            if (result) {
                res.render('class_contents', {
                    videos: result,
                    class: isClass
                });
            } else {
                req.flash('error', '강의를 불러오지 못했습니다');
                res.redirect('/mypage');
            }
        } else {
            req.flash('error', '존재하지 않는 강의입니다');
            res.redirect('/mypage');
        }
    } else {
        req.flash('error', '구매하지 않은 강의입니다');
        res.redirect('/');
    }
});

router.post('/:id/review/like', async (req, res) => {
    const { ClassId, id } = req.body;

    const isThumbs = await Thumbsup.findOne({
        where: {
            ReviewId: id,
            UserUserId: req.user.user_id,
        }
    });
    if (isThumbs) {
        try {
            await Thumbsup.destroy({
                where: {
                    ReviewId: id,
                    UserUserId: req.user.user_id
                }
            });
            const change = await Review.update({
                review_best_num: sequelize.literal('review_best_num - 1'),
            }, {
                where: {
                    id, ClassId
                }
            });
            if (change) {
                const num = await Review.findOne({
                    where: { id, ClassId }
                });
                if (num) {
                    res.send({ status: 'success', message: '좋아요를 취소했습니다', num: num.review_best_num });
                } else {
                    throw { status: 'fail', message: 'DB 오류' };
                }
            } else {
                throw { status: 'fail', message: 'DB 오류' };
            }
        } catch (e) {
            res.status(400).send(e);
        }
    } else {
        try {
            await Thumbsup.create({
                ReviewId: id,
                UserUserId: req.user.user_id
            });
            const change = await Review.update({
                review_best_num: sequelize.literal('review_best_num + 1'),
            }, {
                where: {
                    id, ClassId
                }
            });
            if (change) {
                const num = await Review.findOne({
                    where: { id, ClassId }
                });
                if (num) {
                    res.send({ status: 'success', message: '좋아요를 눌렀습니다', num: num.review_best_num });
                } else {
                    throw { status: 'fail', message: 'DB 오류' };
                }
            } else {
                throw { status: 'fail', message: 'DB 오류' };
            }
        } catch (e) {
            res.status(400).send(e);
        }
    }
    // }
    // const change = await Review.update({
    //     review_best_num: sequelize.literal('review_best_num + 1'),
    // }, {
    //     where: {id, ClassId}
    // });
    // if (change) {
    //     console.log(change);
    //     const result = await Review.findOne({
    //         where: {id, ClassId}
    //     });
    //     if (result) {
    //         console.log(result);
    //         res.send({status: 'success', message: '좋아요', num: result.review_best_num});
    //     } else {
    //         throw { status: 'fail', message: 'DB 오류'};
    //     }
    // } else {
    //     throw { status: 'fail', message: 'DB 오류'};
    // }
});

router.post('/:id/wish', isLoggedIn, async (req, res) => {
    req.params.id;
    const isWish = await Wishlist.findOne({
        where: {
            ClassId: req.params.id,
            UserUserId: req.user.user_id,
        }
    });
    if (isWish) {
        try {
            await Wishlist.destroy({
                where: {
                    ClassId: req.params.id,
                    UserUserId: req.user.user_id,
                }
            });
            const wish_num = await Wishlist.findAndCountAll({
                where: {
                    ClassId: req.params.id
                }
            });
            if (wish_num) {
                res.send({ status: 'success', message: '위시리스트에서 강의를 뺐습니다', num: wish_num.count });
            } else {
                res.send({ status: 'success', message: '위시리스트에서 강의를 뺐습니다' });
            }
        } catch (e) {
            throw { status: 'fail', message: 'DB 오류' };
        }
    } else {
        try {
            await Wishlist.create({
                ClassId: req.params.id,
                UserUserId: req.user.user_id,
            });
            const wish_num = await Wishlist.findAndCountAll({
                where: {
                    ClassId: req.params.id
                }
            });
            if (wish_num) {
                res.send({ status: 'success', message: '찜목록에 넣었습니다', num: wish_num.count });
            } else {
                res.send({ status: 'success', message: '찜목록에 넣었습니다' });
            }
        } catch (e) {
            throw { status: 'fail', message: 'DB 오류' };
        }
    }
})

module.exports = router;