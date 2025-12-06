// Main application initialization
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 WhatsApp Clone initializing...');
  
  // Initialize authentication
  authManager.init();
  
  console.log('✅ Application ready');
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    console.log('📴 Page hidden');
  } else {
    console.log('📱 Page visible');
    // Reconnect socket if needed
    if (authManager.getCurrentUser() && !socketManager.isConnected()) {
      socketManager.connect(authManager.getCurrentUser().id);
    }
  }
});

// Handle before unload
window.addEventListener('beforeunload', () => {
  socketManager.disconnect();
});
