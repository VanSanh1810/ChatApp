class SocketServices {
    connection(socket) {
        console.log('connection: ' + socket.id);
        setInterval(() => {
            socket.emit('info', 'checking !!');
        }, 1000);
        socket.on('disconnect', () => {
            console.log('disconnect');
        });
    }
}

module.exports = new SocketServices();
