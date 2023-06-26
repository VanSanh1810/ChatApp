const admin = require('../../configs/firebase.admin');

class MainAPI {
    //[ALL] /api/*
    verifiedUser(req, res, next) {
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
    chatList(req, res, next) {
        // res.send({
        //     'uid': req._uid,
        // });
    }

    //[POST] /api/messData
    messData(req, res, next) {}

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
                        snapshot.docs.forEach((doc) => {
                            if (doc.data().inviteKey === searchData && doc.id !== req._uid) {
                                isNull = false;
                                let userDataTemp = {
                                    //
                                    img: doc.data().img,
                                    name: doc.data().name,
                                    key: doc.data().inviteKey,
                                };
                                //console.log(userDataTemp._index);
                                res.send(JSON.stringify(userDataTemp));
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
        const key = req.body.inviteKey; //Target key
        const currentKey = req.key; //Sender key

        //Process
        const usersCollectionRef = admin.db.collection('users');
        //Get target user Document
        let targetDocId;
        await usersCollectionRef.get().then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                if (doc.data().inviteKey === key) {
                    targetDocId = doc.id;
                }
            });
        });
        //Update target Document reqResive
        let targetDocRef = usersCollectionRef.doc(targetDocId);
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
        const docRef = usersCollectionRef.doc(_uid);

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
        //Chap nhan loi moi 'accept'
        //Tu choi loi moi 'reject'
        //Thu hoi loi moi 'revoke'
        const collectionRef = admin.db.collection('users');
        let targetDocId;
        await collectionRef.get().then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                if (doc.data().inviteKey === req.body._key) {
                    targetDocId = doc.id;
                }
            });
        });
        const curentDocRef = collectionRef.doc(req._uid); //Curent user doc
        const targetDocRef = collectionRef.doc(targetDocId); //Target user doc
        switch (req.body.type) {
            case 'accept': //Accept target request
                await curentDocRef.update({
                    friends: admin.firebaseApp.firestore.FieldValue.arrayUnion(req.body._key),
                    reqResive: admin.firebaseApp.firestore.FieldValue.arrayRemove(req.body._key),
                });
                await targetDocRef.update({
                    friends: admin.firebaseApp.firestore.FieldValue.arrayUnion(req.key),
                    reqSend: admin.firebaseApp.firestore.FieldValue.arrayRemove(req.key),
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
                    reqResive: admin.firebaseApp.firestore.FieldValue.arrayRemove(req.body._key),
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
                    reqSend: admin.firebaseApp.firestore.FieldValue.arrayRemove(req.body._key),
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
}

module.exports = new MainAPI();
