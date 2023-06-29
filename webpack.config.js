const path = require('path');

module.exports = {
    // The entry point file described above
    // entry: './src/configs/firebase.js',
    entry: {
        "login": './src/configs/client/firebase.js',
        "main": './src/configs/client/main.js',
        "profile": './src/configs/client/profile.js',
        "friendList": './src/configs/client/friendList.js',
        "feedback": './src/configs/client/feedback.js',
    },
    // The location of the build folder described above
    output: {
        path: path.resolve(__dirname, 'src', 'public', 'dist'),
        filename: '[name].js',
    },
    // Optional and for development only. This provides the ability to
    // map the built code back to the original source format when debugging.
    devtool: 'eval-source-map',
};
