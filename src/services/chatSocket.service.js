const admin = require('../configs/firebase.admin');
require('dotenv').config();

class SocketServices {
    connection(socket) {
        //console.log('connection: ' + socket.id);
        //console.log('MESSAGE_PACKET_SIZE: ' + process.env.MESSAGE_PACKET_SIZE)
        socket.on('send-message', async (messageObj, roomId, curentUserUid) => {
            if (roomId) {
                // send message directly to target through socket
                socket.to(roomId).emit('resive-message', messageObj);
                // DB process
                let chatRoomRef = await admin.db.collection('chatRooms').doc(roomId).get();
                let messPakages = await chatRoomRef.data().messPakages; //Array of message packages
                if (messPakages.length > 0) {
                    //Check if user has any messages packages
                    let latestMessPakageId = await messPakages[messPakages.length - 1]; // Latest messPackages ID
                    let latestMessPakage = await admin.db.collection('messPackages').doc(latestMessPakageId).get();
                    let latestMessPakageSize = await latestMessPakage.data().messages.length // Get the size of the latest messPackage
                    if (latestMessPakageSize < process.env.MESSAGE_PACKET_SIZE) {
                        //if the latest messPackage have the size less than the process.env.MESSAGE_PACKET_SIZE
                        admin.db
                            .collection('messPackages')
                            .doc(latestMessPakageId)
                            .update({
                                messages: admin.firebaseApp.firestore.FieldValue.arrayUnion(messageObj),
                            });
                    } else {
                        // package size is equal or greater than process.env.MESSAGE_PACKET_SIZE
                        // Add new messPackage document
                        let newData = {
                            messages: [messageObj],
                        };
                        admin.db
                            .collection('messPackages')
                            .add(newData)
                            .then(function (docRef) {
                                //console.log('Document đã được tạo thành công 1 với ID: ', docRef.id);
                                // Add messPackage to chat room
                                admin.db
                                    .collection('chatRooms')
                                    .doc(roomId)
                                    .update({
                                        messPakages: admin.firebaseApp.firestore.FieldValue.arrayUnion(docRef.id),
                                    });
                            })
                            .catch(function (error) {
                                //console.error('Lỗi khi tạo document: ', error);
                            });
                    }
                } else {
                    // No messPackage found
                    // Add new messPackage document
                    let newData = {
                        messages: [messageObj],
                    };
                    admin.db
                        .collection('messPackages')
                        .add(newData)
                        .then(function (docRef) {
                            //console.log('Document đã được tạo thành công với ID: ', docRef.id);
                            // Add messPackage to chat room
                            admin.db
                                .collection('chatRooms')
                                .doc(roomId)
                                .update({
                                    messPakages: admin.firebaseApp.firestore.FieldValue.arrayUnion(docRef.id),
                                });
                        })
                        .catch(function (error) {
                            //console.error('Lỗi khi tạo document: ', error);
                        });
                }
            }
        });

        // socket.on('seen-confirm', (uid, roomId) => {
        //     if (roomId) {
        //         socket.to(roomId).emit('resive-message', messageObj);
        //         admin.db
        //             .collection('chatRooms')
        //             .doc(roomId)
        //             .update({
        //                 messages: admin.firebaseApp.firestore.FieldValue.arrayUnion(messageObj),
        //             });
        //     }
        // });

        socket.on('join-room', (roomId) => {
            socket.join(roomId);
        });

        socket.on('disconnect', () => {
            console.log('disconnect');
        });
    }
}

module.exports = new SocketServices();
