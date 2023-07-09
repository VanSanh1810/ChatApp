const admin = require('../configs/firebase.admin');

class SocketServices {
    connection(socket) {
        //console.log('connection: ' + socket.id);
        socket.on('send-message', (messageObj, roomId) => {
            if (roomId) {
                socket.to(roomId).emit('resive-message', messageObj);
                admin.db
                    .collection('chatRooms')
                    .doc(roomId)
                    .update({
                        messages: admin.firebaseApp.firestore.FieldValue.arrayUnion(messageObj),
                    });
            }
        });

        socket.on('join-room', (roomId) => {
            socket.join(roomId);
        });

        socket.on('disconnect', () => {
            console.log('disconnect');
        });
    }
}

module.exports = new SocketServices();
