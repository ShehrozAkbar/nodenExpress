exports.error404 = (req, res, next) => {
    // res.status(404).sendFile(path.join(__dirname,'views','notfound.html'));
    res.render('notfound', {
        pageTitle: 'this is error page titlee',
        path: '404 not found',
        isAuthenticated: req.session.isLoggedIn
    });

}