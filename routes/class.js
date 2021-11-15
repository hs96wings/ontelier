const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const Class = require('../models/class');
const Review = require('../models/review');
const Purchase = require('../models/purchase');
const Lecture = require('../models/lecture');

const router = express.Router();

router.get('/:id', (req, res, next) => {
    Class.findOne({
        where: {id: req.params.id}
    })
    .then((result) => {
        res.render('class_view', {
            class: result,
        });
    })
    .catch((error) => {
        res.render('error');
    })
});

router.get('/:id/review', (req, res, next) => {
    Review.findAll({
        where: { ClassId: req.params.id }
    })
    .then((result) => {
        res.render('class_review', {
            reviews: result,
        });
    })
    .catch((error) => {
        res.render('error');
    })
});

router.get('/:id/payment', isLoggedIn, async (req, res, next) => {
    const isPurchase = await Purchase.findOne({
        where: {
            UserUserId: req.user.user_id,
            ClassId: req.params.id,
        }
    });
    if (isPurchase) {
        req.flash('error', '이미 구매한 상품입니다');
        res.redirect('/');
    } else {
        Purchase.create({
            ClassId: req.params.id,
            UserUserId: req.user.user_id,
        })
        .then(() => {
            res.redirect('/mypage');
        })
        .catch((error) => {
            req.flash('error', '구매에 실패했습니다');
            res.redirect('/');
        })
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
        // select classes.id, classes.class_title, lectures.video_url from classes left outer join lectures on classes.id=lectures.ClassId where classes.id=1;
        const isClass = await Class.findOne({
            where: {
                id: req.params.id,
            }
        });
        if (isClass) {
            Lecture.findAll({
                where: {
                    ClassId: req.params.id,
                }
            })
            .then((result) => {
                res.render('class_contents', {
                    videos: result,
                    class: isClass
                });
            })
            .catch(() => {
                req.flash('error', '강의를 불러오지 못했습니다');
                res.redirect('/mypage');
            });
        } else {
            req.flash('error', '없는 강의입니다');
            res.redirect('/mypage');
        }
        // Class.findAll({
        //     where: {
        //         id: req.params.id,
        //     },
        //     include: {
        //         model: Lecture,
        //         attributes: ['video_url']
        //     },
        //     attributes: ['class_title', 'class_img', 'class_info', 'class_cirriculum'],
        // })
        // .then((result) => {
        //     console.log(result);
        //     res.render('class_contents', { datas: result });
        // })
        // .catch(() => {
        //     req.flash('error', '강의를 불러오지 못했습니다');
        //     res.redirect('/mypage');
        // });
    } else {
        req.flash('error', '구매하지 않은 강의입니다');
        res.redirect('/');
    }
});

module.exports = router;