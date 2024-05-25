exports.error404 = (req, res, next) => {
    // res.status(404).sendFile(path.join(__dirname,'views','notfound.html'));
    res.render('notfound', {
        pageTitle: 'this is error page titlee',
        path: '404 not found',
        isAuthenticated: req.session.isLoggedIn
    });

}

exports.err500 = (req, res, next) => {
    const message = req.session.message;
    console.log(message);
    res.render('500', {
        pageTitle: 'this is 500 error page',
        path: '500',
        isAuthenticated: req.session.isLoggedIn,
        errMessage: message
    });
}