const admin = require('../configs/firebase.admin')

class Middleware {
    verify(req, res, next) {
        const sessionCookie = req.cookies.session || '';

        admin.auth
            .verifySessionCookie(sessionCookie, true /** checkRevoked */)
            .then(async (userData) => {
                req._uid = userData.uid; //*
                await admin.db
                    .collection('users')
                    .doc(userData.uid)
                    .get()
                    .then((data) => {
                        req.key = data.data().inviteKey; //*
                    });
                next();
            })
            .catch((error) => {
                res.redirect('/login');
            });
    }
}

module.exports = new Middleware();