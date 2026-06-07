const mongoose = require('mongoose');

const gameRecordSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'normal', 'hard'],
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    targetScore: {
        type: Number,
        required: true
    },
    maxTile: {
        type: Number,
        required: true
    },
    moveCount: {
        type: Number,
        required: true
    },
    timeElapsed: {
        type: Number,
        required: true
    },
    won: {
        type: Boolean,
        default: false
    },
    gridSize: {
        type: Number,
        required: true
    },
    playedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('GameRecord', gameRecordSchema);
