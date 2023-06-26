const express = require('express');
const route = express.Router();

const mainApi = require('../app/controllers/MainAPI');

route.all('/*', mainApi.verifiedUser);
route.post('/chatList', mainApi.chatList);
route.post('/messData', mainApi.messData);
route.post('/userInfo', mainApi.userInfo);
route.post('/userUid', mainApi.userUid);
route.post('/changeUserName', mainApi.changeUserName);
route.post('/updateAvtAccessToken', mainApi.updateAvtAccessToken);
route.post('/searchSuggest', mainApi.searchSuggest);
route.post('/addFriend', mainApi.addFriend);
route.post('/handleRequest', mainApi.handleRequest);

module.exports = route;
