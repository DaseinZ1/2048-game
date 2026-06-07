const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 20
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    nickname: {
        type: String,
        default: function() { return this.username; }
    },
    email: {
        type: String,
        sparse: true
    },
    avatar: {
        type: String,
        default: 'default'
    },
    totalGames: {
        type: Number,
        default: 0
    },
    totalScore: {
        type: Number,
        default: 0
    },
    highestScore: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLoginAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);
