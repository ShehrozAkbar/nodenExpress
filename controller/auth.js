const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const User = require('../modles/user');
const { path } = require('../routes/shop');

const nodemailer = require('nodemailer');

// this 3rd party service needs a domain name to send emails
// const mandrillTransport = require('nodemailer-mandrill-transport');

// this 3rd party service is not verifying my account
// const sandGrid=require('nodemailer-sendgrid-transport');


// for now i am not using any 3rd party package to send my emails
const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'shehrozakbar95@gmail.com',
        pass: 'xegq vtkb ohdt mqek'
    }
})

exports.getLogin = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null
    }

    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        isAuthenticated: req.isLoggedIn,
        csrfToken: req.csrfToken(),
        errorMessage: message
    });
}

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                console.log('wrong email');
                req.flash('error', 'Invalid Email or Password');
                return res.redirect('/login');
            }
            bcrypt.compare(password, user.password)
                .then(match => {
                    if (!match) {
                        req.flash('error', 'Invalid Email or Password')
                        return res.redirect('/login');
                    }

                    req.session.user = user;
                    req.session.isLoggedIn = true;
                    // save function to ensure that the session is saved in the DB before redirecting
                    return req.session.save(() => {
                        res.redirect('/');
                    })

                })
                .catch(err => {
                    console.log(err);
                })

        })
        .catch(err => {
            console.log(err);
        })

}

exports.postLogout = (req, res, next) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
}

exports.getSignUp = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null
    }

    res.render('auth/signup',
        {
            pageTitle: 'Sign Up',
            path: '/signup',
            errorMessage: message
        }
    );
}

exports.postSignUp = (req, res, next) => {

    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    User.findOne({ email: email })
        .then(userData => {
            if (userData) {
                req.flash('error', 'Email already existed!')
                return res.redirect('/signup');
            }
            return bcrypt.hash(password, 12)
                .then(hashPassword => {
                    const user = new User({
                        email: email,
                        password: hashPassword,
                        cart: { items: [] }
                    })
                    return user.save();
                })
                .then(() => {
                    res.redirect('/login');
                    return transport.sendMail({
                        to: email,
                        from: 'shehrozakbar95@gmail.com',
                        subject: 'succesfull signup',
                        html: '<h1>your signup was sucessfull here!</h1>'
                    });
                })
                .catch(err => {
                    console.log(err);
                })

        })
        .catch(err => {
            console.log(err);
        })
};

exports.getReset = (req, res, next) => {
    let errorMessage = req.flash('error');

    if (errorMessage.length > 0) {
        errorMessage = errorMessage[0];
    } else {
        errorMessage = null
    }


    res.render('auth/reset',
        {
            pageTitle: 'Reset Pasword',
            path: '/reset',
            errorMessage: errorMessage
        }
    );
}

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(buffer);
            return res.render('/reset');
        }
        const token = buffer.toString('hex');
        User.findOne({ email: req.body.email })
            .then(user => {
                if (!user) {
                    console.log('Email does not exist');
                    req.flash('error', 'Email does not exist');
                    return res.redirect('/reset');
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                user.save();
                transport.sendMail({
                    to: req.body.email,
                    from: 'shehrozakbar95@gmail.com',
                    subject: 'Reset Password',
                    html: `<h1>This is your Reset Password Email</h1>
                    <p>Click the link <a href='http://localhost:3000/reset/${token}'>here</a> to reset.</p>
                    <p>This Email is only Valid for 1 hour</p>`
                });
            })
            .then(result => {
                res.redirect('/reset');
            })
            .catch(err => {
                console.log(err);
            })
    })
}

exports.getNewPassword = (req, res, next) => {

    const token = req.params.token;

    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            if (!user) {
                req.flash('error', 'User Not found!');
                return res.redirect('/reset');
            }

            let errorMessage = req.flash('error');
            if (errorMessage.length > 0) {
                errorMessage = errorMessage[0];
            } else {
                errorMessage = null
            }

            res.render('auth/new-password', {
                pageTitle: 'Update Pasword',
                path: '/new-Pasword',
                errorMessage: errorMessage,
                userId: user._id
            })

        })


}

exports.postNewPassword = (req, res, next) => {
    const password = req.body.password;
    const userId = req.body.userId;
    User.findOne({ _id: userId })
        .then(user => {
            if (!user) {
                req.flash('error', 'User Not found!');
                return res.redirect('/reset');
            }
            return bcrypt.hash(password, 12)
                .then(hashedPassword => {
                    user.password = hashedPassword;
                    user.resetToken = undefined;
                    user.resetTokenExpiration = undefined;
                    return user.save();
                })
                .then(result => {
                    res.redirect('/login');
                    return transport.sendMail({
                        to: user.email,
                        from: 'shehrozakbar95@gmail.com',
                        subject: 'succesfull Password Reset',
                        html: '<h1>your password reset was sucessfull!</h1>'
                    });

                })
                .catch(err => {
                    console.log(err);
                });
        })
        .catch(err => {
            console.log(err);
        })
}