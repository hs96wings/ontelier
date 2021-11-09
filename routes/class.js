const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const Class = require('../models/class');
const Review = require('../models/review');

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

module.exports = router;