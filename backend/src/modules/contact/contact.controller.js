import { Message } from "./contact.model.js";
import AppError from "../../shared/utils/AppError.js";

// @desc    Submit a contact message (public form submission)
// @route   POST /api/contact
// @access  Public
export const submitMessage = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name) {
      return next(new AppError("Name is required", 400));
    }
    if (!email) {
      return next(new AppError("Email is required", 400));
    }
    if (!message) {
      return next(new AppError("Message content is required", 400));
    }

    const newMessage = await Message.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : "",
      subject: (subject && subject.trim()) || "General Inquiry",
      message: message.trim(),
    });

    res.status(201).json({
      success: true,
      status: "success",
      message: "Your message has been submitted successfully. We will get back to you soon.",
      data: {
        _id: newMessage._id,
        name: newMessage.name,
        email: newMessage.email,
        subject: newMessage.subject,
        createdAt: newMessage.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all contact messages with optional filters
// @route   GET /api/contact
// @access  Private/Admin
export const getMessages = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Message.countDocuments(query);
    const unreadCount = await Message.countDocuments({ status: "unread" });

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      status: "success",
      count: messages.length,
      total,
      unreadCount,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single contact message by ID
// @route   GET /api/contact/:id
// @access  Private/Admin
export const getMessageById = async (req, res, next) => {
  try {
    const msg = await Message.findById(req.params.id);

    if (!msg) {
      return next(new AppError("Message not found", 404));
    }

    // Auto-mark as read when an admin opens it
    if (msg.status === "unread") {
      msg.status = "read";
      await msg.save();
    }

    res.json({
      success: true,
      status: "success",
      data: msg,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update the status of a message (read / unread)
// @route   PATCH /api/contact/:id/status
// @access  Private/Admin
export const updateMessageStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !["read", "unread"].includes(status)) {
      return next(
        new AppError("Status must be either 'read' or 'unread'", 400)
      );
    }

    const msg = await Message.findById(req.params.id);
    if (!msg) {
      return next(new AppError("Message not found", 404));
    }

    msg.status = status;
    const updatedMsg = await msg.save();

    res.json({
      success: true,
      status: "success",
      message: `Message marked as ${status}`,
      data: updatedMsg,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a contact message
// @route   DELETE /api/contact/:id
// @access  Private/Admin
export const deleteMessage = async (req, res, next) => {
  try {
    const msg = await Message.findById(req.params.id);

    if (!msg) {
      return next(new AppError("Message not found", 404));
    }

    await msg.deleteOne();

    res.json({
      success: true,
      status: "success",
      message: "Message deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk delete contact messages
// @route   DELETE /api/contact
// @access  Private/Admin
export const bulkDeleteMessages = async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return next(new AppError("An array of message IDs is required", 400));
    }

    const result = await Message.deleteMany({ _id: { $in: ids } });

    res.json({
      success: true,
      status: "success",
      message: `${result.deletedCount} message(s) deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

