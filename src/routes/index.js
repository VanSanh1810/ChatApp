const webRouter = require('./web');
const mainRouter = require('./main');
const authRouter = require('./auth');
const api = require('./RESTApi');

function route(app){
    app.use('/auth', authRouter);
    app.use('/main', mainRouter);
    app.use('/', webRouter);
    app.use('/api', api);
}

module.exports = route;