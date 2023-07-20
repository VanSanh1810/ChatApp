const express = require('express');
const middleware = require('../middlewares/verifySession');
const route = express.Router();

const mainController = require('../app/controllers/MainController');

//route.all('/*', mainController.verify);
route.get('/index', middleware.verify, mainController.index);
route.get('/profile', middleware.verify, mainController.profile);
route.get('/friendList', middleware.verify, mainController.friendList);
route.get('/feedback', middleware.verify, mainController.feedback);

module.exports = route;