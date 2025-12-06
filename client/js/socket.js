// Socket.IO connection
let socket = null;
let currentUserId = null;

const socketManager = {
  // Initialize socket connection
  connect(userId) {
    if (socket) {
      socket.disconnect();
    }

    currentUserId = userId;
    socket = io(window.location.origin, {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      socket.emit('user:connect', userId);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Set up event listeners
    this.setupEventListeners();
  },

  // Disconnect socket
  disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
      currentUserId = null;
    }
  },

  // Set up socket event listeners
  setupEventListeners() {
    // Receive new message
    socket.on('message:receive', (message) => {
      console.log('📨 Message received:', message);
      if (window.chatManager) {
        window.chatManager.handleIncomingMessage(message);
      }
    });

    // Message sent confirmation
    socket.on('message:sent', (message) => {
      console.log('✅ Message sent:', message);
      if (window.chatManager) {
        window.chatManager.handleMessageSent(message);
      }
    });

    // User status update
    socket.on('user:status', (data) => {
      console.log('👤 User status update:', data);
      if (window.chatManager) {
        window.chatManager.updateUserStatus(data.userId, data.isOnline, data.lastSeen);
      }
    });

    // Typing indicator
    socket.on('typing:display', (data) => {
      if (window.chatManager) {
        window.chatManager.handleTypingIndicator(data.userId, data.isTyping);
      }
    });

    // Message read confirmation
    socket.on('message:read:confirm', (data) => {
      console.log('✓✓ Message read:', data);
    });

    // Error handling
    socket.on('message:error', (error) => {
      console.error('Message error:', error);
    });
  },

  // Send message via socket
  sendMessage(receiver, content, messageType = 'text') {
    if (!socket) {
      console.error('Socket not connected');
      return;
    }

    socket.emit('message:send', {
      sender: currentUserId,
      receiver,
      content,
      messageType
    });
  },

  // Send typing indicator
  startTyping(receiverId) {
    if (!socket) return;
    socket.emit('typing:start', {
      userId: currentUserId,
      receiverId
    });
  },

  stopTyping(receiverId) {
    if (!socket) return;
    socket.emit('typing:stop', {
      userId: currentUserId,
      receiverId
    });
  },

  // Mark message as read
  markAsRead(messageId, senderId) {
    if (!socket) return;
    socket.emit('message:read', {
      messageId,
      senderId
    });
  },

  // Get socket instance
  getSocket() {
    return socket;
  },

  // Check if connected
  isConnected() {
    return socket && socket.connected;
  }
};
