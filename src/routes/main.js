const express = require('express');
const route = express.Router();

const mainController = require('../app/controllers/MainController');

route.all('/*', mainController.verify);
route.get('/index', mainController.index);
route.get('/profile', mainController.profile);
route.get('/friendList', mainController.friendList);
route.get('/feedback', mainController.feedback);

module.exports = route;