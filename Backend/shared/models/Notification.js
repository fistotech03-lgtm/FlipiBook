const mongoose = global.mongoose || require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true
    },
    actorEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    actorName: {
      type: String,
      default: ''
    },
    actorPicture: {
      type: String,
      default: null
    },
    type: {
      type: String,
      enum: ['book_published', 'new_follower'],
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    detail: {
      type: String,
      default: ''
    },
    bookId: {
      type: String,
      default: ''
    },
    bookTitle: {
      type: String,
      default: ''
    },
    bookUrl: {
      type: String,
      default: ''
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ recipientEmail: 1, createdAt: -1 });
notificationSchema.index({ recipientEmail: 1, isRead: 1 });

module.exports =
  mongoose.models.Notification ||
  mongoose.model('Notification', notificationSchema);
