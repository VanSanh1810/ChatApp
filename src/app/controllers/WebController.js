const admin = require('../../configs/firebase.admin');

class WebController {
    // [GET] /login
    loginIndex(req, res, next) {
        res.render('login', { layout: false });
    }
    // [GET] /register
    registerIndex(req, res, next) {
        res.render('register', { layout: false });
    }
}

module.exports = new WebController();
