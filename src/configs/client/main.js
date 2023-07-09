import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, onSnapshot, doc } from 'firebase/firestore';
import {} from 'cookie';

import { io } from 'socket.io-client';
//current user uid
var _uid;
//current user chat room connection
var _roomId;

const socket = io();
// client-side
socket.on('connect', () => {
    console.log(socket.id);
});
// socket.on('info', function (msg) {
//     //console.log(msg);
// });
//////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * The function `getRoomImg` returns the image of a chat room, either from the chat item data or from
 * one of the users in the chat room.
 * @param chatItemData - An object containing data about a chat item. It has the following properties:
 * @returns the value of `chatItemData.img` if it exists. If `chatItemData.img` is not defined, the
 * function is returning the value of `roomImg`.
 */
async function getRoomImg(chatItemData) {
    if (chatItemData.img) {
        return chatItemData.img;
    } else {
        let roomImg;
        chatItemData.users.forEach((user) => {
            if (user._key !== _uid) {
                roomImg = user.img;
            }
        });
        return roomImg;
    }
}

/**
 * The function `getRoomName` returns the room name from `chatItemData` if it exists, otherwise it
 * returns the name of the other user in the chat.
 * @param chatItemData - An object containing data about a chat item. It has the following properties:
 * @returns the room name.
 */
async function getRoomName(chatItemData) {
    if (chatItemData.roomName) {
        return chatItemData.roomName;
    } else {
        let roomName;
        chatItemData.users.forEach((user) => {
            if (user._key !== _uid) {
                roomName = user.name;
            }
        });
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
                break;
        }
    }
    listItem.addEventListener('click', (event) => {
        //Remove all previous messages
        if (event.currentTarget.id !== _roomId) {
            const messageContainer = document.getElementById('message-container');
            messageContainer.innerHTML = '';
        }
        //Pre setup
        const messForm = document.getElementById('messForm');
        messForm.style = '';
        _roomId = event.currentTarget.id;
        socket.emit('join-room', _roomId);
        //console.log('🚀 ~ file: main.js:88 ~ listItem.addEventListener ~ _roomId:', _roomId);
        //Mark selected room
        const listFriend = document.querySelectorAll('.friend-list-item');
        listFriend.forEach((ele) => {
            ele.classList.remove('selected');
        });
        event.currentTarget.classList.add('selected');
        //Load the message at this room
    });
    chatListContainer.appendChild(listItem);
}

// Event listener for DOMContentLoaded event
window.addEventListener('DOMContentLoaded', function () {
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
    function loadMoreMessages() {
        fetch('/api/chatList', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'CSRF-Token': Cookies.get('XSRF-TOKEN'),
            },
        }).then((response) =>
            response.json().then((data) => {
                console.log(data);
            }),
        );

        // Simulate loading more messages from the server
        setTimeout(function () {
            // Create new messages
            for (var i = 0; i < 10; i++) {
                var message = document.createElement('div');
                message.innerText = 'Tin nhắn ' + i;

                // Add new messages to the top of the message container
                messageContainer.insertBefore(message, messageContainer.firstChild);
            }

            // Adjust the scroll position to maintain the user's position
            messageContainer.scrollTop += 10 * 20; // Assuming each message is 20 pixels tall
        }, 500);
    }
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
            const messageObj = {
                messData: messInput.value,
                sendAt: Date.now(),
                sendBy: _uid,
            };
            socket.emit('send-message', messageObj, _roomId);
            // Add the message to container
            const meMessTemp = document.getElementById('meMessTemp');
            const meMess = meMessTemp.cloneNode(true);
            meMess.style = '';
            meMess.textContent = messageObj.messData;
            meMess.setAttribute('data-sendAt', messageObj.sendAt);
            meMess.setAttribute('data-sendBy', messageObj.sendBy);
            messageContainer.appendChild(meMess);
            messageContainer.scrollTop = messageContainer.scrollHeight;
            // Set input to default
            messInput.value = '';
        }
    });

    //Resive the message
    socket.on('resive-message', (messageObj) => {
        //console.log(messageObj);
        const friMessTemp = document.getElementById('friMessTemp');
        const frMess = friMessTemp.cloneNode(true);
        frMess.style = '';
        frMess.firstChild.textContent = messageObj.messData;
        frMess.setAttribute('data-sendAt', messageObj.sendAt);
        frMess.setAttribute('data-sendBy', messageObj.sendBy);
        messageContainer.appendChild(meMess);
        messageContainer.scrollTop = messageContainer.scrollHeight;
    });
});

// Initial loading of messages
//loadMoreMessages();
