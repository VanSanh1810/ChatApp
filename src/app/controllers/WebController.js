const admin = require('../../configs/firebase.admin');

class WebController {
    // [ALL] /*
    verifyState(req, res, next) {}

    // [GET] /login
    loginIndex(req, res, next) {
        const sessionCookie = req.cookies.session || '';

        admin.auth
            .verifySessionCookie(sessionCookie, true /** checkRevoked */)
            .then((userData) => {
                res.redirect('main/index');
            })
            .catch((error) => {
                res.render('login', { layout: false });
            });
    }
    // [GET] /register
    registerIndex(req, res, next) {
        const sessionCookie = req.cookies.session || '';

        admin.auth
            .verifySessionCookie(sessionCookie, true /** checkRevoked */)
            .then((userData) => {
                res.redirect('main/index');
            })
            .catch((error) => {
                res.render('register', { layout: false });
            });
    }
}

module.exports = new WebController();
