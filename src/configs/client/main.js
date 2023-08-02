import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDoc, onSnapshot, doc } from 'firebase/firestore';
import {} from 'cookie';
import { v4 as uuidv4 } from 'uuid';

import { io } from 'socket.io-client';
//current user uid
var _uid;
//current user chat room connection
var _roomId;
//current user chat room messPage -- Default is page 0
var _page = 0;

const socket = io();
// client-side
// socket.on('connect', () => {
//     console.log(socket.id);
// });
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
const db = getFirestore(app);
//////////////////////////////////////////////////////////////////////////////////////////////////////
async function loadMoreMessages() {
    //Load the message at this room
    fetch('/api/messData', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'CSRF-Token': Cookies.get('XSRF-TOKEN'),
        },
        body: JSON.stringify({
            roomId: _roomId,
            page: _page,
        }),
    }).then((response) => {
        response.json().then((data) => {
            if(_page === 0){
                const container = document.getElementById('message-container');
                container.innerHTML = '';
            }
            _page = _page + 1;
            try {
                data.chatPackages.forEach(async (chatPackage) => {
                    for (let i = chatPackage.length - 1; i >= 0; i--) {
                        if (chatPackage[i].sendBy === _uid) {
                            await showMeMess(chatPackage[i], true);
                        } else {
                            await showFriMess(chatPackage[i], true);
                        }
                    }
                });
            } catch (error) {
                console.log("No message to load: " + error.message);
            }
        });
    });
}

/**
 * The function `getRoomImg` retrieves the image of a chat room based on the provided chat item data.
 * @param chatItemData - An object containing data related to a chat item. It may have properties like
 * "img" (representing the image of the chat item) and "users" (an array of user objects).
 * @returns the value of the `roomImg` variable.
 */
async function getRoomImg(chatItemData) {
    if (chatItemData.img) {
        return chatItemData.img;
    } else {
        let roomImg;
        //console.log(chatItemData.users);
        let listUsersKey = [];
        listUsersKey = [...chatItemData.users];
        console.log(listUsersKey);
        await Promise.all(listUsersKey.map(async (user) => {
            if (user._key !== _uid) {
                const docRef = doc(db, 'users', user._key);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    roomImg = await docSnap.data().img;
                } else {
                    // docSnap.data() will be undefined in this case
                    console.log('No such document!');
                }
            }
            return true;
        }));
        return roomImg;
    }
}

/**
 * The function `getRoomName` retrieves the room name from the `chatItemData` object, or if it is not
 * available, it retrieves the name of the other user in the chat.
 * @param chatItemData - An object containing data related to a chat item. It may have the following
 * properties:
 * @returns the room name.
 */
async function getRoomName(chatItemData) {
    if (chatItemData.roomName) {
        return chatItemData.roomName;
    } else {
        let roomName;
        let listUsersKey = await chatItemData.users;
        await Promise.all(listUsersKey.map(async (user) => {
            if (user._key !== _uid) {
                const docRef = doc(db, 'users', user._key);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    roomName = await docSnap.data().name;
                }
            }
        }));
        return roomName;
    }
}

async function addChatItemToContainer(chatItemData) {
    const chatListContainer = document.getElementById('chatListContainer');
    let tempListItem = document.getElementById('tempListItem');
    const listItem = tempListItem.cloneNode(true);
    listItem.style = '';
    listItem.id = chatItemData.roomId;
    var childNodes = listItem.children;
    for (var i = 0; i < childNodes.length; i++) {
        switch (childNodes[i].nodeName) {
            case 'IMG':
                childNodes[i].src = await getRoomImg(chatItemData);
                break;
            case 'DIV':
                let temp = childNodes[i].children;
                for (var j = 0; j < temp.length; j++) {
                    temp[j].textContent = await getRoomName(chatItemData);
                }
                break;
            case 'SPAN':
                childNodes[i].style = 'display: none !important';
                break;
        }
    }
    listItem.addEventListener('click', (event) => {
        //View all messages so set the tag display to none
        event.currentTarget.style = '';
        //Remove all previous messages
        const messageContainer = document.getElementById('message-container');
        messageContainer.innerHTML = '';
        //Pre setup
        const messForm = document.getElementById('messForm');
        messForm.style = '';
        if (_roomId !== event.currentTarget.id) {
            //Prevents set the page back to 0 when multiple click on one chat
            _page = 0;
        }
        _roomId = event.currentTarget.id;
        socket.emit('join-room', _roomId);
        //console.log('🚀 ~ file: main.js:88 ~ listItem.addEventListener ~ _roomId:', _roomId);
        loadMoreMessages();
        //Mark selected room
        const listFriend = document.querySelectorAll('.friend-list-item');
        listFriend.forEach((ele) => {
            ele.classList.remove('selected');
        });
        event.currentTarget.classList.add('selected');
    });
    chatListContainer.appendChild(listItem);
}

async function showFriMess(messageObj, isLoadMore) {
    const messageContainer = document.getElementById('message-container');
    const friMessTemp = document.getElementById('friMessTemp');
    const frMess = friMessTemp.cloneNode(true);
    const frMessInner = frMess.querySelector('.chat-item.friend');
    frMess.style = '';
    frMessInner.textContent = await messageObj.messData;
    frMess.setAttribute('data-messId', messageObj.__id);
    frMess.setAttribute('data-sendAt', messageObj.sendAt);
    frMess.setAttribute('data-sendBy', messageObj.sendBy);
    if (!isLoadMore) {
        messageContainer.appendChild(frMess);
        messageContainer.scrollTop = messageContainer.scrollHeight;
    } else {
        messageContainer.insertBefore(frMess, messageContainer.firstChild);
    }
}
async function showMeMess(messageObj, isLoadMore) {
    const messageContainer = document.getElementById('message-container');
    const meMessTemp = document.getElementById('meMessTemp');
    const meMess = meMessTemp.cloneNode(true);
    meMess.style = '';
    meMess.textContent = await messageObj.messData;
    meMess.setAttribute('data-messId', messageObj.__id);
    meMess.setAttribute('data-sendAt', messageObj.sendAt);
    meMess.setAttribute('data-sendBy', messageObj.sendBy);
    if (!isLoadMore) {
        messageContainer.appendChild(meMess);
        messageContainer.scrollTop = messageContainer.scrollHeight;
    } else {
        messageContainer.insertBefore(meMess, messageContainer.firstChild);
    }
}

// Event listener for DOMContentLoaded event
window.addEventListener('DOMContentLoaded', function () {
    // getDocs(collection(db, 'users')).then((querySnapshot) => {
    //     querySnapshot.forEach((doc) => {
    //         console.log(`${doc.id} => ${doc.data()}`);
    //     });
    // });

    //Watch for changes
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
            // onSnapshot(doc(db, 'users', _uid), (snapshot) => {
            //     getUserInfo();
            // });
        });
    });

    const messageContainer = document.getElementById('message-container');
    messageContainer.scrollTop = messageContainer.scrollHeight;

    // Function to check if the user has scrolled to the top of the chat messages
    function isScrollAtTop() {
        return messageContainer.scrollTop === 0;
    }

    // Function to load more messages when scrolling to the top

    // Event listener for scrolling
    messageContainer.addEventListener('scroll', function () {
        if (isScrollAtTop()) {
            loadMoreMessages();
        }
    });

    // Get chat list
    fetch('/api/chatList', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'CSRF-Token': Cookies.get('XSRF-TOKEN'),
        },
    }).then((response) => {
        response.json().then(async (data) => {
            //Sort by newest first
            Promise.all(
                data.resultChatListId.sort(function (a, b) {
                    return b.lastModifyAt - a.lastModifyAt;
                }),
            );
            //console.log(data.resultChatListId);
            data.resultChatListId.forEach(async (chatListId) => {
                await addChatItemToContainer(chatListId);
            });
        });
    });

    //send message
    const chatForm = document.querySelector('.chat-input');
    chatForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const messInput = document.getElementById('messInput');
        if (messInput.value.trim() !== '' && _roomId.trim() !== '') {
            let sendAt = Date.now();
            const messageObj = {
                __id: uuidv4() + '-' + sendAt,
                messData: messInput.value,
                sendAt: sendAt,
                sendBy: _uid,
                isSeen: false,
            };
            socket.emit('send-message', messageObj, _roomId, _uid);
            // Add the message to container
            showMeMess(messageObj, false);
            // Set input to default
            messInput.value = '';
        }
    });

    //Resive the message
    socket.on('resive-message', (messageObj) => {
        //console.log(messageObj);
        showFriMess(messageObj, false);
        //Confirm seeing the message
        //socket.emit('seen-confirm', _uid, _roomId);
    });
});

// Initial loading of messages
//loadMoreMessages();
