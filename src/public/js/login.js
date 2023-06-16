window.addEventListener('DOMContentLoaded', () => {
    const firebaseConfig = {
        apiKey: 'AIzaSyArTp84OoJOPHrKGwvYwPNFlrCa98vE-ZE',
        authDomain: 'chat-app-7c2ae.firebaseapp.com',
        projectId: 'chat-app-7c2ae',
        storageBucket: 'chat-app-7c2ae.appspot.com',
        messagingSenderId: '229566144713',
        appId: '1:229566144713:web:756d611b23bf904aa3ad18',
        measurementId: 'G-JBK7F17C0F',
    };

    firebase.initializeApp(firebaseConfig);

    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);

    document.getElementById('loginForm').addEventListener('submit', (event) => {
        event.preventDefault();
        const login = event.target.login.value;
        const password = event.target.password.value;

        firebase
            .auth()
            .signInWithEmailAndPassword(login, password)
            .then(({ user }) => {
                return user.getIdToken().then((idToken) => {
                    return fetch('/auth/sessionLogin', {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            'CSRF-Token': Cookies.get('XSRF-TOKEN'),
                        },
                        body: JSON.stringify({ idToken }),
                    });
                });
            })
            .then(() => {
                return firebase.auth().signOut();
            })
            .then(() => {
                window.location.assign('/main/index');
            });
        return false;
    });
});
