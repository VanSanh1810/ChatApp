const express = require('express');
const route = express.Router();

const webController = require('../app/controllers/WebController');

route.get('/login', webController.loginIndex);
route.get('/register', webController.registerIndex);

module.exports = route;