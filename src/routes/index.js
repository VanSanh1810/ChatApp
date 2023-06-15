const webRouter = require('./web');
const mainRouter = require('./main');
const authRouter = require('./auth');

function route(app){
    app.use('/auth', authRouter);
    app.use('/main', mainRouter);
    app.use('/', webRouter);
}

module.exports = route;