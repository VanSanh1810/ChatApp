const admin = require('../../configs/firebase.admin');

class MainController {

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

    // [GET] /main/feedback
    feedback(req, res, next) {
        res.render('feedback');
    }
}

module.exports = new MainController();
