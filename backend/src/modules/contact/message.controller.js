import { Message } from './message.model.js';
import { Notification } from '../notification/notification.model.js';

/**
 * @desc    Send a new message (Public)
 * @route   POST /api/contact/send
 * @access  Public
 */
export const sendMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide name, email, subject, and message'
      });
    }

    const newMessage = await Message.create({
      name,
      email,
      phone,
      subject,
      message
    });

    // Create Notification for Admin
    await Notification.create({
      text: `New contact message from ${name}: ${subject}`,
      type: 'message',
      link: '/admin/messages' // Correct path for admin dashboard
    });

    res.status(201).json({
      status: 'success',
      data: newMessage
    });
  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};

/**
 * @desc    Get all messages (Admin)
 * @route   GET /api/contact/messages
 * @access  Private/Admin
 */
export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: messages.length,
      data: messages
    });
  } catch (error) {
    console.error('Error in getMessages:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};

/**
 * @desc    Delete a message (Admin)
 * @route   DELETE /api/contact/messages/:id
 * @access  Private/Admin
 */
export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);

    if (!message) {
      return res.status(404).json({
        status: 'error',
        message: 'Message not found'
      });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Error in deleteMessage:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};
