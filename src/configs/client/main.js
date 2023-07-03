import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, onSnapshot } from 'firebase/firestore';
import {} from 'cookie';

import { io } from 'socket.io-client';
const socket = io();
socket.on('info', function (msg) {
    console.log(msg);
});

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

    getDocs(collection(db, 'users')).then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            console.log(`${doc.id} => ${doc.data()}`);
        });
    });

    const messageContainer = document.getElementById('message-container');
    messageContainer.scrollTop = messageContainer.scrollHeight;

    const listFriend = document.querySelectorAll('.friend-list-item');

    listFriend.forEach((element) => {
        element.addEventListener('click', () => {
            listFriend.forEach((ele) => {
                ele.classList.remove('selected');
            });
            element.classList.add('selected');
        });
    });

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
});

// Initial loading of messages
//loadMoreMessages();
