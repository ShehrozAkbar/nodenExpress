const bodyParser = require('body-parser');
const path = require('path');
const express = require('express');
// const expressHbs = require('express-handlebars');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash=require('connect-flash');

const User = require('./modles/user');

const shopRouter = require('./routes/shop');
const adminRouter = require('./routes/admin');
const authRouter = require('./routes/auth');

const errController = require('./controller/error');

const MONGODB_URI = 'mongodb+srv://user:2tdk4aFuqjIppYfY@cluster0.y2bazek.mongodb.net/shop?retryWrites=true&w=majority&appName=Cluster0';

const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});


// default setting is: to store the secret that is used for assigning your token to the session(we can change to cookies the default buy passing an object in the function)
const csrfProtection = csrf();


// to register new templating engine in case we are using the one which is not built-in in express
// app.engine('hbs', expressHbs.engine({layoutsDir:'views/layouts/', defaultLayout: 'main-layout.hbs'}));

// pug is a built-in templating engine in express
// ejs is al
// app.set('view engine', 'hbs');

app.set('view engine', 'ejs')
app.set('views', 'views');

// these are middlewares
// Middleware functions can perform the following tasks:
// Execute any code.
// Make changes to the request and the response objects.
// End the request-response cycle.
// Call the next middleware in the stack.


// these are the middleware functions
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'my secret', resave: false, saveUninitialized: false, store: store }));
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => {
            console.log(err);
        })
})

// to add some data in every rendered view
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken=req.csrfToken();
    next();
});

// these are the routes [which are also middleware function]
app.use('/admin', adminRouter);
app.use(shopRouter);
app.use(authRouter);

// handeling 404
app.use(errController.error404);

mongoose.connect(MONGODB_URI)
    .then((result) => {
        console.log('DB connected!');
        app.listen(3000);
    })
    .catch(err => {
        console.error(err);
    });