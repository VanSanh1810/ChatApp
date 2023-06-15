const express = require('express');
const route = express.Router();

const authController = require('../app/controllers/AuthController');

route.post('/sessionLogin', authController.sessionLogin);
route.get('/sessionLogout', authController.sessionLogout);

module.exports = route;