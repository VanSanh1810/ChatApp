const admin = require('../configs/firebase.admin');


module.exports = {
    //Internal method
    async getName(userId) {
        let data = await admin.db.collection('users').doc(userId).get();
        return data.data().name;
    },

    async getImg(userId) {
        let data = await admin.db.collection('users').doc(userId).get();
        return data.data().img;
    }
}