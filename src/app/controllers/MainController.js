const admin = require('../../configs/firebase.admin');

class MainController {
    // [GET] /main/index
    index(req, res, next) {
        const sessionCookie = req.cookies.session || '';

        admin
            .auth
            .verifySessionCookie(sessionCookie, true /** checkRevoked */)
            .then((userData) => {
                console.log('Logged in:', userData.email);
                res.render('home');
            })
            .catch((error) => {
                res.redirect('/login');
            });
    }
}

module.exports = new MainController();
