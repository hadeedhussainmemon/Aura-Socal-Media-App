import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    caption: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        default: '',
    },
    tags: [{ type: String }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);

export default Post;
