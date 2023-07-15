const admin = require('../../configs/firebase.admin');
const crypto = require('crypto');
const utilsRoom = require('../../utils/roomIdGen');
const utilsUserInfo = require('../../utils/userInfoById');

class MainAPI {
    ////////////////////////////////
    //Route functions

    //[ALL] /api/*
    verified(req, res, next) {
        const sessionCookie = req.cookies.session || '';

        admin.auth
            .verifySessionCookie(sessionCookie, true /** checkRevoked */)
            .then(async (userData) => {
                req._uid = userData.uid; //*
                await admin.db
                    .collection('users')
                    .doc(userData.uid)
                    .get()
                    .then((data) => {
                        req.key = data.data().inviteKey; //*
                    });
                next();
            })
            .catch((error) => {
                res.redirect('/login');
            });
    }

    //[POST] /api/chatList
    async chatList(req, res, next) {
        let chatListId = [];
        await admin.db
            .collection('users')
            .doc(req._uid)
            .get()
            .then((data) => {
                chatListId = data.data().chatRooms;
            });
        let resultChatListId = await Promise.all(
            chatListId.map(async (roomId) => {
                let data = await admin.db.collection('chatRooms').doc(roomId).get();
                let newItem = {
                    users: data.data().users,
                    roomId: roomId,
                    //lastMess: data.data().messages.length === 0 ? '' : data.data().messages[data.data().messages.length - 1],
                    lastModifyAt: data.data().lastModifyAt,
                };
                return newItem;
            }),
        );
        res.send(JSON.stringify({ resultChatListId }));
    }

    //[POST] /api/messData
    async messData(req, res, next) {
        let resultPackage = [];
        //
        let _uid = req._uid;
        let roomId = req.body.roomId;
        let page = req.body.page;
        let data = await admin.db.collection('chatRooms').doc(roomId).get();
        let listMessPageId = await data.data().messPakages;
        let anchorPackage = (await listMessPageId.length) - 1 - page * process.env.MESSAGE_PAGE_SIZE;
        //console.log(anchorPackage);
        if (anchorPackage >= 0) {
            for (let i = anchorPackage; i >= anchorPackage - process.env.MESSAGE_PAGE_SIZE; i--) {
                if (listMessPageId[i]) {
                    console.log(listMessPageId[i]);
                    resultPackage.push(listMessPageId[i]);
                }
            }
            let newResult = await Promise.all(
                resultPackage.map(async (packId) => {
                    let data = await admin.db.collection('messPackages').doc(packId).get();
                    return await data.data().messages;
                }),
            );
            res.send(
                JSON.stringify({
                    chatPackages: newResult,
                }),
            );
        } else {
            res.send(JSON.stringify(resultPackage));
        }
    }

    //[POST] /api/userInfo
    async userInfo(req, res, next) {
        //for store data
        let listRequest = [];
        let listResive = [];
        let result;
        await admin.db
            .collection('users')
            .doc(req._uid)
            .get()
            .then((snapshot) => {
                listRequest = snapshot.data().reqSend;
                listResive = snapshot.data().reqResive;
                result = {
                    name: snapshot.data().name,
                    img: snapshot.data().img,
                    inviteKey: snapshot.data().inviteKey,
                    reqResive: [],
                    reqSend: [],
                    friends: snapshot.data().friends,
                    chatRooms: snapshot.data().chatRooms,
                    blockList: snapshot.data().blockList,
                    joinAt: snapshot.data().joinAt,
                };
            });
        //for send data
        const newListRequest = await Promise.all(
            listRequest.map(async (inviteKey) => {
                let snapshot = await admin.db.collection('users').get();
                const matchingDoc = snapshot.docs.find((doc) => doc.data().inviteKey === inviteKey);
                if (matchingDoc) {
                    return {
                        _key: matchingDoc.data().inviteKey,
                        _name: matchingDoc.data().name,
                        _img: matchingDoc.data().img,
                    };
                }
                return null;
            }),
        );

        const newListReive = await Promise.all(
            listResive.map(async (inviteKey) => {
                let snapshot = await admin.db.collection('users').get();
                const matchingDoc = snapshot.docs.find((doc) => doc.data().inviteKey === inviteKey);
                if (matchingDoc) {
                    return {
                        _key: matchingDoc.data().inviteKey,
                        _name: matchingDoc.data().name,
                        _img: matchingDoc.data().img,
                    };
                }
                return null;
            }),
        );
        result.reqResive = newListReive;
        result.reqSend = newListRequest;
        res.json(result);
    }

    //[POST] /api/changeUserName
    changeUserName(req, res, next) {
        let _uid = req._uid;
        //console.log(_uid);
        const newName = req.body.newName;
        admin.db
            .collection('users')
            .doc(_uid)
            .update({
                name: newName,
            })
            .then(
                res.json({
                    message: 'User name updated successfully !',
                }),
            )
            .catch((err) => console.log(err));
    }

    //[POST] /api/updateAvtAccessToken
    updateAvtAccessToken(req, res, next) {
        const _uid = req._uid;

        // Lấy tham chiếu đến Firebase Storage
        const storage = admin.storage;
        const bucket = storage.bucket();
        const fileName = 'userAvt/' + _uid;
        // Lấy URL tải xuống công khai
        bucket
            .file(fileName)
            .getSignedUrl({
                action: 'read',
                expires: '03-01-2500', // Đặt ngày hết hạn xa về tương lai
            })
            .then((signedUrls) => {
                const downloadUrl = signedUrls[0];
                admin.db
                    .collection('users')
                    .doc(_uid)
                    .update({
                        img: downloadUrl,
                    })
                    .then(
                        res.json({
                            message: 'Avatar updated successfully !',
                        }),
                    )
                    .catch((err) => console.log(err));
            })
            .catch((error) => {
                console.error('Lỗi khi lấy download URL:', error);
            });
    }

    //[POST] /api/searchSuggest
    async searchSuggest(req, res, next) {
        const searchData = req.body.searchData;
        // console.log(req.body.searchType);
        admin.db
            .collection('users')
            .get()
            .then((snapshot) => {
                switch (req.body.searchType) {
                    case 'key':
                        let isNull = true;
                        snapshot.docs.forEach(async (doc) => {
                            if (doc.data().inviteKey === searchData && doc.id !== req._uid) {
                                isNull = false;
                                //console.log(userDataTemp._index);
                                res.send(JSON.stringify({
                                    img: await doc.data().img,
                                    name: await doc.data().name,
                                    key: await doc.data().inviteKey,
                                }));
                            }
                        });
                        if (isNull) {
                            res.json({
                                message: 'You are searching your own key',
                            });
                        }
                        break;
                    case 'name':
                        var usersDataObj = [];
                        snapshot.docs.forEach((doc) => {
                            if (doc.id !== req._uid) {
                                let tempData = {
                                    _index: parseInt(doc.data().inviteKey, 16),
                                    key: doc.data().inviteKey,
                                    img: doc.data().img,
                                    name: doc.data().name,
                                };
                                usersDataObj.push(tempData);
                            }
                        });
                        res.send(JSON.stringify(usersDataObj));
                        break;
                }
            });
    }

    //[POST] /api/userUid
    userUid(req, res, next) {
        res.json({
            _uid: req._uid,
        });
    }

    //[POST] /api/addFriend
    async addFriend(req, res, next) {
        let _uid = req._uid;
        const key = await req.body.inviteKey; //Target key
        const currentKey = await req.key; //Sender key

        //Process
        const usersCollectionRef = admin.db.collection('users');

        //Update target Document reqResive
        let targetDocRef = usersCollectionRef.doc(key); //Target Document ref
        targetDocRef.get().then(async (data) => {
            var reqList = await data.data().reqResive;
            var friendList = await data.data().friends;

            if (!reqList.includes(currentKey) && !friendList.includes(currentKey)) {
                //Not already sent or friend already
                reqList.push(currentKey);
                await targetDocRef.update({
                    reqResive: reqList,
                });
            }
        });

        //Get current user Document
        const docRef = usersCollectionRef.doc(_uid); //current document ref

        var data = await docRef.get();
        var reqList = await data.data().reqSend;
        var friendList = await data.data().friends;

        if (!reqList.includes(key) && !friendList.includes(key)) {
            //Not already sent or friend already
            reqList.push(key);
            await docRef.update({
                reqSend: reqList,
            });
        }

        //Success
        res.send(
            JSON.stringify({
                message: 'Friend request sent successfully',
            }),
        );
    }

    //[POST] /api/handleRequest
    async handleRequest(req, res, next) {
        const currentKey = req._uid;
        const targetKey = req.body._key;
        //Chap nhan loi moi 'accept'
        //Tu choi loi moi 'reject'
        //Thu hoi loi moi 'revoke'
        const collectionRef = admin.db.collection('users');
        const curentDocRef = collectionRef.doc(currentKey); //Curent user doc
        const targetDocRef = collectionRef.doc(targetKey); //Target user doc
        switch (req.body.type) {
            case 'accept': //Accept target request
                await curentDocRef.update({
                    friends: admin.firebaseApp.firestore.FieldValue.arrayUnion(targetKey),
                    reqResive: admin.firebaseApp.firestore.FieldValue.arrayRemove(targetKey),
                });
                await targetDocRef.update({
                    friends: admin.firebaseApp.firestore.FieldValue.arrayUnion(req.key),
                    reqSend: admin.firebaseApp.firestore.FieldValue.arrayRemove(req.key),
                });

                //Add new chat room for 2 users
                let generateRoomId = utilsRoom.compareHexValues(currentKey, targetKey);
                let roomRef = admin.db.collection('chatRooms').doc(generateRoomId);
                roomRef.get().then(async (snapshot) => {
                    if (!snapshot.exists) {
                        roomRef.set({
                            messPakages: [],
                            users: [
                                { _key: targetKey},
                                { _key: currentKey},
                            ],
                            createAt: Date.now(),
                            isDisable: false,
                            lastModifyAt: Date.now(),
                        });
                    } else {
                        roomRef.update({
                            isDisable: false,
                        });
                    }
                });

                //Update id chat room to each user data
                await curentDocRef.update({
                    chatRooms: admin.firebaseApp.firestore.FieldValue.arrayUnion(generateRoomId),
                });
                await targetDocRef.update({
                    chatRooms: admin.firebaseApp.firestore.FieldValue.arrayUnion(generateRoomId),
                });

                //Success
                res.send(
                    JSON.stringify({
                        message: 'Request accepted',
                    }),
                );
                break;
            case 'reject': //Reject target request
                await curentDocRef.update({
                    reqResive: admin.firebaseApp.firestore.FieldValue.arrayRemove(targetKey),
                });
                await targetDocRef.update({
                    reqSend: admin.firebaseApp.firestore.FieldValue.arrayRemove(req.key),
                });
                res.send(
                    JSON.stringify({
                        message: 'Request denied',
                    }),
                );
                break;
            case 'revoke': //Revoke curent request
                await curentDocRef.update({
                    reqSend: admin.firebaseApp.firestore.FieldValue.arrayRemove(targetKey),
                });
                await targetDocRef.update({
                    reqResive: admin.firebaseApp.firestore.FieldValue.arrayRemove(req.key),
                });
                res.send(
                    JSON.stringify({
                        message: 'Request revoked',
                    }),
                );
                break;
        }
    }

    //[POST] /api/getListFriends
    async getListFriends(req, res, next) {
        // Số lượng items trên mỗi trang
        const pageSize = 15;
        let anchor = req.body.lastDocAnchor;
        //
        let friendList = [];
        const usersCollectionRef = admin.db.collection('users');
        const currentDocRef = usersCollectionRef.doc(req._uid);
        //Get friend list
        await currentDocRef.get().then((data) => {
            friendList = data.data().friends;
        });
        //Process
        let result = [];
        let newAnchor = '';
        if (friendList.length > 0) {
            if (!Boolean(anchor)) {
                //No anchor, start from the first document
                await usersCollectionRef
                    .where('inviteKey', 'in', friendList)
                    .orderBy('inviteKey', 'asc')
                    .limit(pageSize)
                    .get()
                    .then((snapshot) => {
                        snapshot.docs.forEach((doc) => {
                            let tempItem = {
                                img: doc.data().img,
                                name: doc.data().name,
                                _key: doc.data().inviteKey,
                            };
                            result.push(tempItem);
                        });
                        newAnchor = snapshot.docs[snapshot.docs.length - 1].id;
                    });
            } else {
                //start from the anchor
                await usersCollectionRef
                    .where('inviteKey', 'in', friendList)
                    .orderBy('inviteKey', 'asc')
                    .startAfter(anchor)
                    .limit(pageSize)
                    .get()
                    .then((snapshot) => {
                        snapshot.docs.forEach((doc) => {
                            let tempItem = {
                                img: doc.data().img,
                                name: doc.data().name,
                                _key: doc.data().inviteKey,
                            };
                            result.push(tempItem);
                        });
                        newAnchor = snapshot.docs[snapshot.docs.length - 1].id;
                    });
            }
        }
        //console.log(result);
        res.send(
            JSON.stringify({
                result: result,
                newAnchor: newAnchor,
            }),
        );
    }

    //[POST] /api/userFeedback
    async userFeedback(req, res, next) {
        //console.log(req.body);
        let userFeedback = {
            userUid: req._uid,
            feedBack: req.body.feedbackData,
            sendAt: Date.now().toString(),
        };
        await admin.db
            .collection('feedBacks')
            .add(userFeedback)
            .then(() => {
                console.log('feedback sended successfully');
                res.send(
                    JSON.stringify({
                        message: 'Feedback sent successfully',
                    }),
                );
            });
    }

    //[POST] /api/getFriendData
    async getFriendData(req, res, next) {
        var friendID = req.body.key;
        var result;
        const friendDocRef = admin.db.collection('users').doc(friendID);
        await friendDocRef.get().then((data) => {
            result = {
                img: data.data().img,
                name: data.data().name,
                friends: data.data().friends.length,
                joinAt: data.data().joinAt,
                inviteKey: data.data().inviteKey,
            };
        });
        res.send(JSON.stringify(result));
    }

    //[POST] /api/unFriend
    async unFriend(req, res, next) {
        const currentDocRef = admin.db.collection('users').doc(req._uid);
        const targetDocRef = admin.db.collection('users').doc(req.body.key);

        let roomId = this.compareHexValues(req._uid, req.body.key);
        await currentDocRef.update({
            friends: admin.firebaseApp.firestore.FieldValue.arrayRemove(req.body.key),
        });
        await targetDocRef.update({
            friends: admin.firebaseApp.firestore.FieldValue.arrayRemove(req._uid),
        });
        admin.db.collection('chatRooms').doc(roomId).update({
            //Disable room
            isDisable: true,
        });
        res.send(
            JSON.stringify({
                message: 'Unfriend successfully !',
            }),
        );
    }
}

module.exports = new MainAPI();
