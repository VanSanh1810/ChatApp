const admin = require('./configs/firebase.admin');
const express = require('express');
const path = require('path');
const handlebars = require('express-handlebars');
const cors = require('cors'); //https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
const app = express();
const route = require('./routes');

const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
const ChatSocketServices = require('./services/chatSocket.service');

//Declare __io for socket.io services
global.__io = io;

const bodyParser = require('body-parser');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

const csrfMiddleware = csrf({ cookie: true });

const port = process.env.PORT || 3000;

//Static files
app.use(express.static(path.join(__dirname, '/public')));

//Templates engine
app.engine('hbs', handlebars.engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources', 'views'));

//Read form data so web can access req.body contents
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Use Cross-origin resource sharing (CORS)
app.use(cors());

app.use(bodyParser.json());
app.use(cookieParser());
app.use(csrfMiddleware);

//when we first load the page, we get the XSRF token from the Client
app.all('*', (req, res, next) => {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    next();
});

////////////////////////////////////////////////////////////////
// admin.db.collection('users').onSnapshot(snapshot => {
//     let changes = snapshot.docChanges();
//     changes.forEach(change =>{
//         console.log(change.doc.data(), change.doc.id);
//     })
// })

//Routes init
route(app);

////////////////////////////////////////////////////////
//Set socket connection when first connect to server
global.__io.on('connection', ChatSocketServices.connection);


server.listen(port, () => {
    ///??????
    console.log(`App listening on port ${port}`);
});
