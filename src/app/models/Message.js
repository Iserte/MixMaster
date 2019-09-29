import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema(
  {
    channelID: {
      type: String,
      required: true,
    },
    messageID: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Message', MessageSchema);
