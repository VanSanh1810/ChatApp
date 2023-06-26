const firebaseApp = require('firebase-admin');

var serviceAccount = require('./chat-app-7c2ae-firebase-adminsdk-n9ldu-16b3dc9ec1.json');

const app = firebaseApp.initializeApp({
    credential: firebaseApp.credential.cert(serviceAccount),
    databaseURL: 'https://chat-app-7c2ae-default-rtdb.asia-southeast1.firebasedatabase.app',
    storageBucket: 'chat-app-7c2ae.appspot.com',
});

const db = firebaseApp.firestore(app);
const auth = firebaseApp.auth(app);
const storage = firebaseApp.storage(app);
module.exports = { app, db, auth, storage, firebaseApp};
