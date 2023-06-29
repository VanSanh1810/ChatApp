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
var lastDocAnchor = '';

async function getFriendData(event) {
    //console.log(event.currentTarget.id);
    var friendData;
    let response = await fetch('/api/getFriendData', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'CSRF-Token': Cookies.get('XSRF-TOKEN'),
        },
        body: JSON.stringify({
            key: event.currentTarget.id,
        }),
    });
    //friend data resive
    await response.json().then((data) => {
        // console.log(data);
        friendData = data;
    });
    //Push data to UI
    const friendImg = document.getElementById('friendImg');
    const friendName = document.getElementById('friendName');
    const joinAt = document.getElementById('joinAt');
    const cFriend = document.getElementById('cFriend');
    const inviteKey = document.getElementById('inviteKey');
    const btnUnf = document.getElementById('btnUnf');
    const btnAcceptUnf = document.getElementById('acceptUnf');

    friendImg.src = friendData.img + '&cache=' + Date.now(); //Caching image
    friendName.innerText = friendData.name;
    joinAt.innerText = new Date(friendData.joinAt);
    cFriend.innerText = friendData.friends;
    inviteKey.innerText = friendData.inviteKey;
    //btnUnf.setAttribute('data-id', friendData.inviteKey);
    btnUnf.style = '';
    btnAcceptUnf.setAttribute('data-id', friendData.inviteKey);

    document.getElementById('friendProfileContainer').style = '';
}

async function addFriendItem(item) {
    //Clone the item
    const tempItem = document.getElementById('friendItemTemp');
    var friendItem = tempItem.cloneNode(true);
    friendItem.id = await item._key;
    friendItem.addEventListener('click', function (event) {
        getFriendData(event);
    });
    friendItem.style = '';
    //Change inner items
    var childNodes = friendItem.children;
    for (var i = 0; i < childNodes.length; i++) {
        switch (childNodes[i].nodeName) {
            case 'IMG':
                childNodes[i].src = item.img;
                break;
            case 'SPAN':
                childNodes[i].textContent = item.name;
                break;
        }
    }
    return friendItem;
}

async function loadMoreFriendItems() {
    //Container
    const friendListContainer = document.getElementById('friendListContainer');
    let response = await fetch('/api/getListFriends', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'CSRF-Token': Cookies.get('XSRF-TOKEN'),
        },
        body: JSON.stringify({
            lastDocAnchor: lastDocAnchor,
        }),
    });
    //friend items resive
    response.json().then((data) => {
        console.log(data.result);
        data.result.forEach(async (friendItem) => {
            //console.log(friendItem);
            friendListContainer.appendChild(await addFriendItem(friendItem));
        });
        lastDocAnchor = data.newAnchor;
    });
}

function showToastMessage(message, typeOfToast) {
    var toastNode = document.getElementById('toast');
    var toastMess = document.getElementById('toast-message');

    switch (typeOfToast) {
        case 'notification':
            toastNode.style.backgroundColor = 'rgb(105, 254, 105)';
            break;
        case 'success':
            toastNode.style.backgroundColor = 'rgb(105, 254, 105)';
            break;
        case 'error':
            toastNode.style.backgroundColor = 'rgb(255, 119, 119)';
            break;
    }

    var toast = new bootstrap.Toast(toastNode);

    toastMess.innerText = message;
    toast.show();
}

window.addEventListener('DOMContentLoaded', function () {
    const unfModal = document.getElementById('unfModal');
    unfModal.addEventListener('show.bs.modal', function (event) {
        var acceptUnfBtn = document.getElementById('acceptUnf');
        acceptUnfBtn.addEventListener('click', function (event) {
            console.log('send');
            fetch('/api/unFriend', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'CSRF-Token': Cookies.get('XSRF-TOKEN'),
                },
                body: JSON.stringify({
                    key: acceptUnfBtn.getAttribute('data-id'),
                }),
            }).then((response) => {
                let id = acceptUnfBtn.getAttribute('data-id');
                const nodeToRemove = document.getElementById(id);
                if (nodeToRemove) {
                    document.getElementById('friendProfileContainer').style = 'display: none !important;';
                    nodeToRemove.remove();
                }
                response.json().then((data) => {
                    showToastMessage(data.message, 'success');
                });
            });
        });
    });

    //Event listener
    const divElement = document.getElementById('friendListContainer');
    divElement.addEventListener('scroll', function () {
        // Kiểm tra xem phần tử có được lăn xuống cuối trang hay không
        if (divElement.scrollTop + divElement.clientHeight === divElement.scrollHeight) {
            loadMoreFriendItems();
        }
    });

    loadMoreFriendItems();

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
});
