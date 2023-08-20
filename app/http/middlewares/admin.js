function admin(req, res, next) {

    // || req.user.role === 'admin'
    if (req.isAuthenticated()) {
        return next();
    }
    return res.redirect('/');
}

module.exports = admin;