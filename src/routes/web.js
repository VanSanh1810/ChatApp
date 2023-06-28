const express = require('express');
const route = express.Router();

const webController = require('../app/controllers/WebController');

route.all('/*', webController.verifyState)
route.get('/login', webController.loginIndex);
route.get('/register', webController.registerIndex);

module.exports = route;