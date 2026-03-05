import mongoose from 'mongoose';

const SaveSchema = new mongoose.Schema({
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

// Ensure a user can only save a specific post once
SaveSchema.index({ user: 1, post: 1 }, { unique: true });

const Save = mongoose.models.Save || mongoose.model('Save', SaveSchema);

export default Save;
