const admin = require('../../configs/firebase.admin');

class AuthController {
    // [POST] /auth/sessionLogin
    sessionLogin(req, res) {
        const idToken = req.body.idToken.toString();

        const expiresIn = 60 * 60 * 24 * 5 * 1000;

        admin
            .auth
            .createSessionCookie(idToken, { expiresIn })
            .then(
                (sessionCookie) => {
                    const options = { maxAge: expiresIn, httpOnly: true };
                    res.cookie('session', sessionCookie, options);
                    res.end(JSON.stringify({ status: 'success' }));
                },
                (error) => {
                    res.status(401).send('UNAUTHORIZED REQUEST!');
                },
            );
    }

    // [GET] /auth/sessionLogout
    sessionLogout(req, res, next) {
        res.clearCookie('session');
        res.redirect('/login');
    }
}

module.exports = new AuthController();
