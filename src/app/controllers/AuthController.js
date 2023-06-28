const admin = require('../../configs/firebase.admin');
const crypto = require('crypto');

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

    // [POST] /auth/sessionRegister
    sessionRegister(req, res) {
        const idToken = req.body.idToken.toString();
        const _uid = req.body._uid.toString();
        admin.db.collection('users').doc(_uid).set({
            name: "default",
            img: "https://firebasestorage.googleapis.com/v0/b/chat-app-7c2ae.appspot.com/o/default-user-image.png?alt=media&token=0ee66124-03fc-4d62-add2-3de7e0320e59",
            inviteKey: crypto.randomBytes(16).toString('hex'),
            reqResive: [],
            reqSend: [],
            friends: [],
            chatRooms: [],
            blockList: [],
            joinAt: Date.now(),
        })
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
