const admin = require('../../configs/firebase.admin');

class MainController {
    // [ALL] /main/*
    verify(req, res, next){
        const sessionCookie = req.cookies.session || '';

        admin
            .auth
            .verifySessionCookie(sessionCookie, true /** checkRevoked */)
            .then((userData) => {
                next();
            })
            .catch((error) => {
                res.redirect('/login');
            });
    }

    // [GET] /main/index
    index(req, res, next) {
        res.render('home');
    }


    // [GET] /main/profile
    profile(req, res, next) {
        res.render('profile');
    }

    // [GET] /main/friendList
    friendList(req, res, next) {
        res.render('friendList');
    }
}

module.exports = new MainController();
