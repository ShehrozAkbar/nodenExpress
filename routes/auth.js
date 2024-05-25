const express = require('express');

const authController = require('../controller/auth');
const { check, body } = require('express-validator');
const User = require('../modles/user');

const router = express();

router.get('/login', authController.getLogin);

router.post('/login',
    [
        body('email', 'please enter a valid email')
            .isEmail()
            .normalizeEmail(),
        body('password', 'please enter a valid password')
            .trim()
            .isLength({ min: 5 })
            .isAlphanumeric()
    ],
    authController.postLogin);

router.post('/logout', authController.postLogout);

router.get('/signup', authController.getSignUp);

// we can add as many middlewheres as we want. but after the path 
router.post('/signup',
    check('email', 'Invalid Email address bro')
        .isEmail()
        .custom((value, { req }) => {
            // if (value === 'shehrozjatt8@gmail.com') {
            //     throw new Error('this email is forbiden!');
            // }
            // return true;
            // this is our own async validation
            return User.findOne({ email: value })
                .then(userData => {
                    if (userData) {
                        return Promise.reject('Email already existed!');
                    }
                })
        })
        .normalizeEmail(),
    body('password', 'please eneter a password with only number and text with more than 5 characters.')
        .isAlphanumeric()
        .isLength({ min: 5 })
        .trim(),
    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('passwords have to match!');
            }
            return true;
        })
        .trim(),
    authController.postSignUp);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;