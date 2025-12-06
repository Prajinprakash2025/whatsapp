// Authentication manager
const authManager = {
  currentUser: null,

  // Initialize auth
  init() {
    this.setupEventListeners();
    this.checkAuth();
  },

  // Set up event listeners
  setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    // Register form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => this.handleRegister(e));
    }

    // Toggle between login and register
    const showRegisterBtn = document.getElementById('show-register');
    const showLoginBtn = document.getElementById('show-login');

    if (showRegisterBtn) {
      showRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.showRegisterForm();
      });
    }

    if (showLoginBtn) {
      showLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.showLoginForm();
      });
    }

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.logout());
    }
  },

  // Check if user is authenticated
  async checkAuth() {
    const token = api.getToken();
    
    if (!token) {
      this.showAuthContainer();
      return;
    }

    try {
      const response = await api.getCurrentUser();
      this.currentUser = response.user;
      this.showChatContainer();
    } catch (error) {
      console.error('Auth check failed:', error);
      api.removeToken();
      this.showAuthContainer();
    }
  },

  // Handle login
  async handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
      const response = await api.login(email, password);
      api.setToken(response.token);
      this.currentUser = response.user;
      this.showChatContainer();
    } catch (error) {
      alert('Login failed: ' + error.message);
    }
  },

  // Handle registration
  async handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
      const response = await api.register(username, email, password);
      api.setToken(response.token);
      this.currentUser = response.user;
      this.showChatContainer();
    } catch (error) {
      alert('Registration failed: ' + error.message);
    }
  },

  // Logout
  logout() {
    api.removeToken();
    socketManager.disconnect();
    this.currentUser = null;
    this.showAuthContainer();
  },

  // Show auth container
  showAuthContainer() {
    document.getElementById('auth-container').style.display = 'flex';
    document.getElementById('chat-container').style.display = 'none';
  },

  // Show chat container
  showChatContainer() {
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('chat-container').style.display = 'grid';
    
    // Update current user info
    document.getElementById('current-user-name').textContent = this.currentUser.username;
    document.getElementById('current-user-avatar').src = this.currentUser.profilePicture;
    
    // Initialize socket connection
    socketManager.connect(this.currentUser.id);
    
    // Initialize chat manager
    if (window.chatManager) {
      window.chatManager.init();
    }
  },

  // Show register form
  showRegisterForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
  },

  // Show login form
  showLoginForm() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
  },

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }
};
