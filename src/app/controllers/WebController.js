const admin = require('../../configs/firebase.admin');

class WebController {

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

    // [GET] /resetPassword
    resetPassword(req, res, next) {
        const sessionCookie = req.cookies.session || '';

        admin.auth
            .verifySessionCookie(sessionCookie, true /** checkRevoked */)
            .then((userData) => {
                res.redirect('main/index');
            })
            .catch((error) => {
                res.render('fogotPass', { layout: false });
            });
    }
}

module.exports = new WebController();
