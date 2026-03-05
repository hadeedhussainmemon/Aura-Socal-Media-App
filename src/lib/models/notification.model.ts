import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        required: true,
        enum: ['new_post', 'like', 'comment', 'follow']
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    avatar: { type: String },
    actionUrl: { type: String },
    read: { type: Boolean, default: false },
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fromUserName: { type: String },
    fromUserAvatar: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

export default Notification;
