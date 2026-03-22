import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['message', 'donation', 'event', 'system'],
    default: 'system'
  },
  link: {
    type: String, // Path to navigate in admin panel
    default: ''
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);

export { Notification };
