// Chat manager
const chatManager = {
  contacts: [],
  currentChat: null,
  messages: {},
  typingTimeout: null,

  // Initialize chat
  async init() {
    await this.loadContacts();
    this.setupEventListeners();
  },

  // Set up event listeners
  setupEventListeners() {
    // Search contacts
    const searchInput = document.getElementById('search-contacts');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.filterContacts(e.target.value));
    }

    // Message input
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
      messageInput.addEventListener('input', () => this.handleTyping());
      messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }

    // Send button
    const sendBtn = document.getElementById('send-btn');
    if (sendBtn) {
      sendBtn.addEventListener('click', () => this.sendMessage());
    }

    // Emoji button
    const emojiBtn = document.getElementById('emoji-btn');
    const emojiPicker = document.getElementById('emoji-picker');
    if (emojiBtn && emojiPicker) {
      emojiBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'block' : 'none';
      });

      // Click on emoji to insert
      emojiPicker.addEventListener('click', (e) => {
        if (e.target.classList.contains('emoji-item')) {
          const emoji = e.target.textContent;
          if (emoji && messageInput) {
            messageInput.value += emoji;
            messageInput.focus();
          }
        }
      });

      // Close emoji picker when clicking outside
      document.addEventListener('click', (e) => {
        if (!emojiPicker.contains(e.target) && e.target !== emojiBtn) {
          emojiPicker.style.display = 'none';
        }
      });
    }
  },

  // Load contacts
  async loadContacts() {
    try {
      const response = await api.getUsers();
      this.contacts = response.users;
      this.renderContacts();
    } catch (error) {
      console.error('Failed to load contacts:', error);
    }
  },

  // Render contacts list
  renderContacts(filteredContacts = null) {
    const contactsList = document.getElementById('contacts-list');
    const contacts = filteredContacts || this.contacts;

    contactsList.innerHTML = contacts.map(contact => `
      <div class="contact-item" data-user-id="${contact._id}" onclick="chatManager.openChat('${contact._id}')">
        <img src="${contact.profilePicture}" alt="${contact.username}" class="avatar">
        <div class="contact-info">
          <h4>${contact.username}</h4>
          <p class="contact-status-${contact._id}">
            ${contact.isOnline ? '<span class="status online">Online</span>' : 'Offline'}
          </p>
        </div>
      </div>
    `).join('');
  },

  // Filter contacts
  filterContacts(query) {
    const filtered = this.contacts.filter(contact =>
      contact.username.toLowerCase().includes(query.toLowerCase())
    );
    this.renderContacts(filtered);
  },

  // Open chat with user
  async openChat(userId) {
    this.currentChat = this.contacts.find(c => c._id === userId);
    
    if (!this.currentChat) return;

    // Update UI
    document.getElementById('empty-state').style.display = 'none';
    document.getElementById('chat-window').style.display = 'flex';
    
    document.getElementById('chat-user-name').textContent = this.currentChat.username;
    document.getElementById('chat-user-avatar').src = this.currentChat.profilePicture;
    document.getElementById('chat-user-status').textContent = this.currentChat.isOnline ? 'Online' : 'Offline';
    document.getElementById('chat-user-status').className = this.currentChat.isOnline ? 'status online' : 'status';

    // Highlight active contact
    document.querySelectorAll('.contact-item').forEach(item => {
      item.classList.remove('active');
    });
    document.querySelector(`[data-user-id="${userId}"]`)?.classList.add('active');

    // Load messages
    await this.loadMessages(userId);
  },

  // Load messages for current chat
  async loadMessages(userId) {
    try {
      const response = await api.getMessages(userId);
      this.messages[userId] = response.messages;
      this.renderMessages();
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  },

  // Render messages
  renderMessages() {
    if (!this.currentChat) return;

    const messagesContainer = document.getElementById('messages-container');
    const currentUserId = authManager.getCurrentUser().id;
    const messages = this.messages[this.currentChat._id] || [];

    messagesContainer.innerHTML = messages.map(msg => {
      const isSent = msg.sender._id === currentUserId;
      const time = new Date(msg.createdAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });

      return `
        <div class="message ${isSent ? 'sent' : 'received'}">
          <div class="message-bubble">
            <div class="message-content">${this.escapeHtml(msg.content)}</div>
            <div class="message-time">${time}</div>
          </div>
        </div>
      `;
    }).join('');

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  },

  // Send message
  sendMessage() {
    if (!this.currentChat) return;

    const input = document.getElementById('message-input');
    const content = input.value.trim();

    if (!content) return;

    // Send via socket
    socketManager.sendMessage(this.currentChat._id, content);

    // Clear input
    input.value = '';

    // Stop typing indicator
    socketManager.stopTyping(this.currentChat._id);
  },

  // Handle incoming message
  handleIncomingMessage(message) {
    const senderId = message.sender._id;
    const receiverId = message.receiver._id;
    const currentUserId = authManager.getCurrentUser().id;

    // Determine which user's message list to update
    const otherUserId = senderId === currentUserId ? receiverId : senderId;

    if (!this.messages[otherUserId]) {
      this.messages[otherUserId] = [];
    }

    this.messages[otherUserId].push(message);

    // If this is the current chat, render messages
    if (this.currentChat && this.currentChat._id === otherUserId) {
      this.renderMessages();
    }
  },

  // Handle message sent confirmation
  handleMessageSent(message) {
    this.handleIncomingMessage(message);
  },

  // Handle typing indicator
  handleTyping() {
    if (!this.currentChat) return;

    socketManager.startTyping(this.currentChat._id);

    // Clear previous timeout
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    // Stop typing after 2 seconds of inactivity
    this.typingTimeout = setTimeout(() => {
      socketManager.stopTyping(this.currentChat._id);
    }, 2000);
  },

  // Handle typing indicator display
  handleTypingIndicator(userId, isTyping) {
    if (!this.currentChat || this.currentChat._id !== userId) return;

    const indicator = document.getElementById('typing-indicator');
    indicator.style.display = isTyping ? 'flex' : 'none';
  },

  // Update user status
  updateUserStatus(userId, isOnline, lastSeen) {
    // Update in contacts list
    const contact = this.contacts.find(c => c._id === userId);
    if (contact) {
      contact.isOnline = isOnline;
      contact.lastSeen = lastSeen;
    }

    // Update status display in contact list
    const statusElement = document.querySelector(`.contact-status-${userId}`);
    if (statusElement) {
      statusElement.innerHTML = isOnline ? '<span class="status online">Online</span>' : 'Offline';
    }

    // Update current chat status
    if (this.currentChat && this.currentChat._id === userId) {
      document.getElementById('chat-user-status').textContent = isOnline ? 'Online' : 'Offline';
      document.getElementById('chat-user-status').className = isOnline ? 'status online' : 'status';
    }
  },

  // Escape HTML to prevent XSS
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// Make chatManager globally accessible
window.chatManager = chatManager;
