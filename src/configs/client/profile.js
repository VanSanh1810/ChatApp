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

// Event listener for DOMContentLoaded event
window.addEventListener('DOMContentLoaded', function () {
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
            onSnapshot(doc(db, 'users', _uid), (snapshot) => {
                getUserInfo();
            });
        });
    });

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

    //Event click img for changes the user image
    const imagePreview = document.getElementById('profileImg');
    const fileInput = document.getElementById('fileInp');
    imagePreview.addEventListener('click', function () {
        fileInput.click();
    });

    async function getUserInfo() {
        //handle the request
        var handleRequest = async (_key, type) => {
            //Chap nhan loi moi 'accept'
            //Tu choi loi moi 'reject'
            //Thu hoi loi moi 'revoke'
            fetch('/api/handleRequest', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'CSRF-Token': Cookies.get('XSRF-TOKEN'),
                },
                body: JSON.stringify({
                    _key: _key,
                    type: type,
                })
            }).then((response) => {
                response.json().then((data) => {
                    showToastMessage(data.message, 'success');
                });
            });
        };

        //Clone and add to requestSended or requestReceived list
        var cloneAndAddReqItems = (data, isResive) => {
            if (isResive) {
                //add to resive list
                let tempItem = document.getElementById('reqResiveItemTemp');
                let itemContainer = document.getElementById('reqResiveList');
                itemContainer.innerHTML = ''; //Remove all previous results
                data.forEach(async (item) => {
                    let itemToAdd = tempItem.cloneNode(true);
                    itemToAdd.style = '';
                    //Change the child node data
                    var childNodes = itemToAdd.children;
                    for (var i = 0; i < childNodes.length; i++) {
                        switch (childNodes[i].nodeName) {
                            case 'IMG':
                                childNodes[i].src = item._img;
                                break;
                            case 'H5':
                                childNodes[i].textContent = item._name;
                                break;
                            case 'BUTTON':
                                childNodes[i].setAttribute('data-key', item._key);
                                if (childNodes[i].getAttribute('data-btntype') === 'accept') {
                                    //accept request
                                    await childNodes[i].addEventListener('click', () => handleRequest(item._key, 'accept'));
                                } else {
                                    //reject request
                                    await childNodes[i].addEventListener('click', () => handleRequest(item._key, 'reject'));
                                }
                                break;
                        }
                    }
                    itemContainer.appendChild(itemToAdd);
                });
            } else {
                //add to send list
                let tempItem = document.getElementById('reqSendedItemTemp');
                let itemContainer = document.getElementById('reqSendedList');
                itemContainer.innerHTML = ''; //Remove all previous results
                data.forEach(async (item) => {
                    let itemToAdd = tempItem.cloneNode(true);
                    itemToAdd.style = '';
                    //Change the child node data
                    var childNodes = itemToAdd.children;
                    for (var i = 0; i < childNodes.length; i++) {
                        switch (childNodes[i].nodeName) {
                            case 'IMG':
                                childNodes[i].src = item._img;
                                break;
                            case 'H5':
                                childNodes[i].textContent = item._name;
                                break;
                            case 'BUTTON':
                                childNodes[i].setAttribute('data-key', item._key);
                                //cancel send request
                                await childNodes[i].addEventListener('click', () => handleRequest(item._key, 'revoke'));
                                break;
                        }
                    }
                    itemContainer.appendChild(itemToAdd);
                });
            }
        };

        let response = await fetch('/api/userInfo', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'CSRF-Token': Cookies.get('XSRF-TOKEN'),
            },
        });
        let reqSend = [];
        let reqResive = [];
        await response.json().then(async (data) => {
            console.log('Data changed');
            //console.log(data);
            const cFriend = document.getElementById('cFriend');
            const cReq = document.getElementById('cReq');
            const inviteKey = document.getElementById('inviteKey');
            const joinAt = document.getElementById('joinAt');
            const userName = document.getElementById('userName');
            const profileImg = document.getElementById('profileImg');

            userName.innerText = data.name;
            cFriend.innerText = data.friends.length;
            inviteKey.innerText = data.inviteKey;
            joinAt.innerText = new Date(data.joinAt);
            cReq.innerText = data.reqResive.length;
            profileImg.src = data.img;

            reqSend = await data.reqSend;
            //console.log(data.reqSend);
            reqResive = await data.reqResive;
            //console.log(data.reqReive);
            ////////////////////////////////////////////////////////////////

            cloneAndAddReqItems(reqResive, true);

            cloneAndAddReqItems(reqSend, false);
        });
    }

    //Change user name
    const btn_changeName = document.getElementById('btn_changeName');
    const textName = document.getElementById('uName');
    btn_changeName.addEventListener('click', () => {
        if (textName.value !== '') {
            fetch('/api/changeUserName', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'CSRF-Token': Cookies.get('XSRF-TOKEN'),
                },
                body: JSON.stringify({ newName: textName.value }),
            }).then((response) => {
                response.json().then((data) => {
                    showToastMessage(data.message, 'success');
                });
            });
        } else {
            this.alert('Enter your new name !!!');
        }
    });

    //Work with file input
    fileInput.addEventListener('change', async () => {
        let fileItem;
        let fileName;
        fileItem = await fileInput.files[0];
        let response = await fetch('/api/userUid', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'CSRF-Token': Cookies.get('XSRF-TOKEN'),
            },
        });
        let data = await response.json();
        fileName = await data._uid;
        let storageRef = await ref(storage, 'userAvt/' + fileName);
        try {
            await deleteObject(storageRef);
        } catch (error) {
            console.log(error);
        }
        let uploadResult = await uploadBytes(storageRef, fileItem).then((snapshot) => {});
        await fetch('/api/updateAvtAccessToken', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'CSRF-Token': Cookies.get('XSRF-TOKEN'),
            },
        }).then((response) => {
            response.json().then((data) => {
                showToastMessage(data.message, 'success');
            });
        });
    });

    function searchByName(objects, searchQuery) {
        var result = objects.filter(function (obj) {
            var name = obj.name.toLowerCase();
            var search = searchQuery.toLowerCase();

            //Chia nhỏ các thành các từ
            const myArray = name.split(' ');

            var isOk = false;
            myArray.forEach(function (item) {
                if (item.length >= search.length) {
                    for (var i = 0; i < item.length + 1; i++) {
                        if (i === search.length || i === item.length) {
                            // Đã kiểm tra hết các ký tự trong chuỗi tìm kiếm
                            isOk = true;
                            break;
                        } else {
                            if (item[i] !== search[i]) {
                                break;
                            }
                        }
                    }
                }
            });
            return isOk;
        });

        return result;
    }

    const searchInput = this.document.getElementById('searchInput');
    const searchSuggest = this.document.getElementById('searchSuggest');
    const loaderIcon = this.document.getElementById('loaderIcon');

    searchInput.addEventListener('input', async (event) => {
        if (event.target.value !== '') {
            //console.log('Giá trị đã thay đổi: ', event.target.value);

            //show loader icon
            loaderIcon.classList.add('d-flex');
            loaderIcon.classList.remove('hidden-suggest');
            //show suggestion container
            searchSuggest.classList.remove('hidden-suggest');

            //Remove previous suggestion
            var divsToRemove = document.querySelectorAll('.suggest-container .list-group-item');
            divsToRemove.forEach((div) => {
                div.remove();
            });

            var searchData = await event.target.value;
            var typeOfInput = (d) => {
                if (d.length >= 32) {
                    // console.log('key');
                    return 'key';
                }
                // console.log('name');
                return 'name';
            };
            async function addFriendClick(data) {
                //console.log(data.target.id);
                fetch('/api/addFriend', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        'CSRF-Token': Cookies.get('XSRF-TOKEN'),
                    },
                    body: JSON.stringify({
                        inviteKey: data.target.id,
                    }),
                }).then((response) => {
                    response.json().then((data) => {
                        showToastMessage(data.message, 'success');
                    });
                });
            }

            //Function clone search item and put to search container
            var cloneAndAddSearchItem = async (data) => {
                var searchItemTemp = document.getElementById('searchItemTemp');
                var searchItem = searchItemTemp.cloneNode(true);
                searchItem.style = '';

                var childNodes = searchItem.children;
                for (var i = 0; i < childNodes.length; i++) {
                    switch (childNodes[i].nodeName) {
                        case 'IMG':
                            childNodes[i].src = data.img;
                            break;
                        case 'H5':
                            childNodes[i].textContent = data.name;
                            break;
                        case 'BUTTON':
                            childNodes[i].id = await data.key;
                            childNodes[i].addEventListener('click', addFriendClick);
                            break;
                    }
                }
                return searchItem;
            };
            //Get suggestions
            await fetch('/api/searchSuggest', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'CSRF-Token': Cookies.get('XSRF-TOKEN'),
                },
                body: JSON.stringify({
                    searchData: searchData,
                    searchType: typeOfInput(searchData),
                }),
            }).then((response) => {
                //console.log('search successful');
                if (typeOfInput(searchData) === 'key') {
                    response.json().then((data) => {
                        if (data.name) {
                            console.log(data.name);
                        } else {
                            //no data or searching your own key
                            showToastMessage(data.message, 'error');
                        }
                    });
                } else {
                    response.json().then(async (datas) => {
                        if (datas.length > 0) {
                            const result = await searchByName(datas, searchData);
                            if (result.length > 0) {
                                //Handle layout here
                                result.forEach(async (data) => {
                                    searchSuggest.appendChild(await cloneAndAddSearchItem(data));
                                });
                            } else {
                                console.log('no users found');
                                searchSuggest.classList.add('hidden-suggest');
                            }
                        } else {
                            console.log('no users found on db');
                            searchSuggest.classList.add('hidden-suggest');
                        }
                    });
                }
            });

            //hide loader icon
            loaderIcon.classList.remove('d-flex');
            loaderIcon.classList.add('hidden-suggest');
        } else {
            //hide suggestion container
            searchSuggest.classList.add('hidden-suggest');
            //hide loader icon
            loaderIcon.classList.remove('d-flex');
            loaderIcon.classList.add('hidden-suggest');

            //Remove previous suggestion
            var divsToRemove = document.querySelectorAll('.suggest-container .list-group-item');
            divsToRemove.forEach((div) => {
                div.remove();
            });
        }
    });
});
