const express = require('express');
const middleware = require('../middlewares/verifySession')
const route = express.Router();

const mainApi = require('../app/controllers/MainAPI');

//route.all('/*', mainApi.verified);
route.post('/chatList', middleware.verify, mainApi.chatList);
route.post('/messData', middleware.verify, mainApi.messData);
route.post('/userInfo', middleware.verify, mainApi.userInfo);
route.post('/userUid', middleware.verify, mainApi.userUid);
route.post('/changeUserName', middleware.verify, mainApi.changeUserName);
route.post('/updateAvtAccessToken', middleware.verify, mainApi.updateAvtAccessToken);
route.post('/searchSuggest', middleware.verify, mainApi.searchSuggest);
route.post('/addFriend', middleware.verify, mainApi.addFriend);
route.post('/handleRequest', middleware.verify, mainApi.handleRequest);
route.post('/getListFriends', middleware.verify, mainApi.getListFriends);
route.post('/userFeedback', middleware.verify, mainApi.userFeedback);
route.post('/getFriendData', middleware.verify, mainApi.getFriendData);
route.post('/unFriend', middleware.verify, mainApi.unFriend);

module.exports = route;
