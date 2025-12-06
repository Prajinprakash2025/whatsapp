const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// @route   GET /api/messages/:userId
// @desc    Get conversation with specific user
// @access  Private
router.get('/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Get all messages between current user and target user
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    })
    .populate('sender', 'username profilePicture')
    .populate('receiver', 'username profilePicture')
    .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/messages
// @desc    Send a message
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { receiver, content, messageType = 'text' } = req.body;

    if (!receiver || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide receiver and content'
      });
    }

    // Create message
    const message = await Message.create({
      sender: req.user._id,
      receiver,
      content,
      messageType
    });

    // Populate sender and receiver info
    await message.populate('sender', 'username profilePicture');
    await message.populate('receiver', 'username profilePicture');

    // Update or create conversation
    const conversation = await Conversation.getOrCreate(req.user._id, receiver);
    conversation.lastMessage = message._id;
    conversation.lastMessageTime = message.createdAt;
    
    // Increment unread count for receiver
    const unreadCount = conversation.unreadCount.get(receiver.toString()) || 0;
    conversation.unreadCount.set(receiver.toString(), unreadCount + 1);
    
    await conversation.save();

    res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/messages/:id/read
// @desc    Mark message as read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only receiver can mark as read
    if (message.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    message.isRead = true;
    message.readAt = Date.now();
    await message.save();

    res.status(200).json({
      success: true,
      message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/messages/conversations/all
// @desc    Get all conversations for current user
// @access  Private
router.get('/conversations/all', protect, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
    .populate('participants', 'username profilePicture isOnline lastSeen')
    .populate('lastMessage')
    .sort({ lastMessageTime: -1 });

    res.status(200).json({
      success: true,
      count: conversations.length,
      conversations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
