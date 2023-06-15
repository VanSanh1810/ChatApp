const express = require('express');
const route = express.Router();

const mainController = require('../app/controllers/MainController');

route.get('/index', mainController.index);

module.exports = route;