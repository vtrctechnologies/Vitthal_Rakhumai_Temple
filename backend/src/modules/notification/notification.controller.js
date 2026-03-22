import { Notification } from './notification.model.js';

/**
 * @desc    Get all notifications (Admin)
 * @route   GET /api/notifications
 * @access  Private/Admin
 */
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort('-createdAt').limit(20);

    res.status(200).json({
      status: 'success',
      results: notifications.length,
      data: notifications
    });
  } catch (error) {
    console.error('Error in getNotifications:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};

/**
 * @desc    Mark notification as read (Admin)
 * @route   PATCH /api/notifications/:id/read
 * @access  Private/Admin
 */
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true, runValidators: true }
    );

    if (!notification) {
      return res.status(404).json({
        status: 'error',
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: notification
    });
  } catch (error) {
    console.error('Error in markAsRead:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};

/**
 * @desc    Clear all notifications (Admin)
 * @route   DELETE /api/notifications/clear
 * @access  Private/Admin
 */
export const clearNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({});

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Error in clearNotifications:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};
