// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import {} from 'cookie';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Initialize Firebase
// const firebaseApp = initializeApp(firebaseConfig);
// const firebaseAnalytics = getAnalytics(firebaseApp);
// const auth = getAuth(firebaseApp);

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
window.addEventListener('DOMContentLoaded', () => {
    const firebaseConfig = {
        apiKey: 'AIzaSyArTp84OoJOPHrKGwvYwPNFlrCa98vE-ZE',
        authDomain: 'chat-app-7c2ae.firebaseapp.com',
        databaseURL: 'https://chat-app-7c2ae-default-rtdb.asia-southeast1.firebasedatabase.app',
        projectId: 'chat-app-7c2ae',
        storageBucket: 'chat-app-7c2ae.appspot.com',
        messagingSenderId: '229566144713',
        appId: '1:229566144713:web:756d611b23bf904aa3ad18',
        measurementId: 'G-JBK7F17C0F',
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const login = document.querySelector('#email').value;
            const password = document.querySelector('#pwd').value;

            signInWithEmailAndPassword(auth, login, password)
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
                    return auth.signOut();
                })
                .then(() => {
                    window.location.assign('/main/index');
                });
            return false;
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const login = document.querySelector('#email').value;
            const password = document.querySelector('#pwd').value;
            const rePass = document.querySelector('#re-pwd').value;

            if (login == '' || password == '' || rePass == '') {
                alert('Please enter all required fields');
            } else {
                if (password != rePass) {
                    alert('Password must be same as re-password');
                } else {
                    createUserWithEmailAndPassword(auth, login, password)
                        .then(({ user }) => {
                            return user.getIdToken().then((idToken) => {
                                return fetch('/auth/sessionRegister', {
                                    method: 'POST',
                                    headers: {
                                        Accept: 'application/json',
                                        'Content-Type': 'application/json',
                                        'CSRF-Token': Cookies.get('XSRF-TOKEN'),
                                    },
                                    body: JSON.stringify({ idToken, _uid: user.uid }),
                                });
                            });
                        })
                        .then(() => {
                            return auth.signOut();
                        })
                        .then(() => {
                            window.location.assign('/main/index');
                        });
                    return false;
                }
            }
        });
    }

    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log('Auth state changed');
        } else {
            console.log('No User defined');
        }
    });
});
