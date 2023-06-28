import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, doc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getStorage, ref, listAll, uploadBytes, deleteObject } from 'firebase/storage';
import {} from 'cookie';

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
// Initialize Cloud Storage and get a reference to the service
const storage = getStorage(app);
//User uid
var _uid;

//Friend list page
var page = 0;

window.addEventListener('DOMContentLoaded', function () {
    //get user uid
    fetch('/api/userUid', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'CSRF-Token': Cookies.get('XSRF-TOKEN'),
        },
    }).then((response) => {
        response.json().then((data) => {
            _uid = data._uid;
        });
    });

    async function loadMoreFriendItems(page) {
        let response = await fetch('/api/getListFriends', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'CSRF-Token': Cookies.get('XSRF-TOKEN'),
            },
            body: JSON.stringify({
                page: page,
            }),
        });
        //friend items resive
        response.json().then((data) => {
            data.forEach((friendItem) => {
                console.log(friendItem);
            })
        });
    }

    //Event listener
    const divElement = document.getElementById('friendListContainer');
    divElement.addEventListener('scroll', function () {
        // Kiểm tra xem phần tử có được lăn xuống cuối trang hay không
        if (divElement.scrollTop + divElement.clientHeight === divElement.scrollHeight) {
            loadMoreFriendItems(page);
        }
    });

    loadMoreFriendItems(0)
});
