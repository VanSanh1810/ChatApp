const express = require('express');
const route = express.Router();

const mainApi = require('../app/controllers/MainAPI');

route.all('/*', mainApi.verified);
route.post('/chatList', mainApi.chatList);
route.post('/messData', mainApi.messData);
route.post('/userInfo', mainApi.userInfo);
route.post('/userUid', mainApi.userUid);
route.post('/changeUserName', mainApi.changeUserName);
route.post('/updateAvtAccessToken', mainApi.updateAvtAccessToken);
route.post('/searchSuggest', mainApi.searchSuggest);
route.post('/addFriend', mainApi.addFriend);
route.post('/handleRequest', mainApi.handleRequest);
route.post('/getListFriends', mainApi.getListFriends);
route.post('/userFeedback', mainApi.userFeedback);
route.post('/getFriendData', mainApi.getFriendData);
route.post('/unFriend', mainApi.unFriend);

module.exports = route;
