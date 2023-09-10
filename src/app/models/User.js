
class User {
    constructor(name){
        this.name: "default";
        this.img: "https://firebasestorage.googleapis.com/v0/b/chat-app-7c2ae.appspot.com/o/default-user-image.png?alt=media&token=0ee66124-03fc-4d62-add2-3de7e0320e59";
        this.inviteKey: _uid;
        this.reqResive: [];
        this.reqSend: [];
        this.friends: [];
        this.chatRooms: [];
        this.blockList: [];
        this.joinAt: Date.now();
    }
}

module.exports = User;