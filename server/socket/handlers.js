const Message = require('../models/Message');
const User = require('../models/User');
const Conversation = require('../models/Conversation');

// Store connected users
const connectedUsers = new Map();

const socketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle user authentication and connection
    socket.on('user:connect', async (userId) => {
      try {
        // Store socket connection
        connectedUsers.set(userId, socket.id);
        
        // Update user status in database
        await User.findByIdAndUpdate(userId, {
          isOnline: true,
          socketId: socket.id,
          lastSeen: new Date()
        });

        // Join user to their own room
        socket.join(userId);

        // Notify all users about online status
        io.emit('user:status', {
          userId,
          isOnline: true
        });

        console.log(`User ${userId} is now online`);
      } catch (error) {
        console.error('Error in user:connect:', error);
      }
    });

    // Handle sending messages
    socket.on('message:send', async (data) => {
      try {
        const { sender, receiver, content, messageType = 'text' } = data;

        // Create message in database
        const message = await Message.create({
          sender,
          receiver,
          content,
          messageType
        });

        // Populate sender and receiver info
        await message.populate('sender', 'username profilePicture');
        await message.populate('receiver', 'username profilePicture');

        // Update conversation
        const conversation = await Conversation.getOrCreate(sender, receiver);
        conversation.lastMessage = message._id;
        conversation.lastMessageTime = message.createdAt;
        
        // Increment unread count for receiver
        const unreadCount = conversation.unreadCount.get(receiver.toString()) || 0;
        conversation.unreadCount.set(receiver.toString(), unreadCount + 1);
        
        await conversation.save();

        // Send message to receiver if online
        const receiverSocketId = connectedUsers.get(receiver);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('message:receive', message);
        }

        // Send confirmation to sender
        socket.emit('message:sent', message);

        console.log(`Message sent from ${sender} to ${receiver}`);
      } catch (error) {
        console.error('Error in message:send:', error);
        socket.emit('message:error', { message: error.message });
      }
    });

    // Handle typing indicator
    socket.on('typing:start', (data) => {
      const { userId, receiverId } = data;
      const receiverSocketId = connectedUsers.get(receiverId);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing:display', {
          userId,
          isTyping: true
        });
      }
    });

    socket.on('typing:stop', (data) => {
      const { userId, receiverId } = data;
      const receiverSocketId = connectedUsers.get(receiverId);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing:display', {
          userId,
          isTyping: false
        });
      }
    });

    // Handle message read status
    socket.on('message:read', async (data) => {
      try {
        const { messageId, senderId } = data;

        // Update message read status
        await Message.findByIdAndUpdate(messageId, {
          isRead: true,
          readAt: new Date()
        });

        // Notify sender
        const senderSocketId = connectedUsers.get(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit('message:read:confirm', {
            messageId,
            readAt: new Date()
          });
        }
      } catch (error) {
        console.error('Error in message:read:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      try {
        // Find and remove user from connected users
        let disconnectedUserId = null;
        for (const [userId, socketId] of connectedUsers.entries()) {
          if (socketId === socket.id) {
            disconnectedUserId = userId;
            connectedUsers.delete(userId);
            break;
          }
        }

        if (disconnectedUserId) {
          // Update user status in database
          await User.findByIdAndUpdate(disconnectedUserId, {
            isOnline: false,
            lastSeen: new Date(),
            socketId: null
          });

          // Notify all users about offline status
          io.emit('user:status', {
            userId: disconnectedUserId,
            isOnline: false,
            lastSeen: new Date()
          });

          console.log(`User ${disconnectedUserId} disconnected`);
        }
      } catch (error) {
        console.error('Error in disconnect:', error);
      }
    });
  });
};

module.exports = socketHandlers;
