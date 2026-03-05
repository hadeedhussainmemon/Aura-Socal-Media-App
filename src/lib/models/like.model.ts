import mongoose from 'mongoose';

const LikeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Ensure a user can only like a specific post once
LikeSchema.index({ user: 1, post: 1 }, { unique: true });

const Like = mongoose.models.Like || mongoose.model('Like', LikeSchema);

export default Like;
