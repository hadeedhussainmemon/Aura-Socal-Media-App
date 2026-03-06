import { Schema, models, model } from "mongoose";

const ConversationSchema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    lastMessageText: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Index for quick lookup of conversations for a user
ConversationSchema.index({ participants: 1 });

const Conversation = models.Conversation || model("Conversation", ConversationSchema);

export default Conversation;
