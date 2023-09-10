const express = require('express');
const route = express.Router();

const webController = require('../app/controllers/WebController');

route.get('/login', webController.loginIndex);
route.get('/register', webController.registerIndex);
route.get('/resetPass', webController.resetPassword);
route.get('/', webController.loginIndex);

module.exports = route;