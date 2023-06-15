const firebaseApp = require("firebase-admin");

const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');



var serviceAccount = require('./chat-app-7c2ae-firebase-adminsdk-n9ldu-16b3dc9ec1.json');

const app = firebaseApp.initializeApp({
  credential: firebaseApp.credential.cert(serviceAccount),
  databaseURL: "https://chat-app-7c2ae-default-rtdb.asia-southeast1.firebasedatabase.app"
});



const db = getFirestore(app);
const auth = getAuth(app)
module.exports = {app, db, auth}