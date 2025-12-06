# WhatsApp Clone - Real-time Messaging Application

A full-stack, production-ready WhatsApp-like messaging application built with Node.js, Express, Socket.IO, MongoDB, and vanilla JavaScript.

![WhatsApp Clone](https://img.shields.io/badge/Status-Production%20Ready-success)
![Node.js](https://img.shields.io/badge/Node.js-16%2B-green)
![MongoDB](https://img.shields.io/badge/MongoDB-5.0%2B-green)

## ✨ Features

- 🔐 **User Authentication** - Secure JWT-based registration and login
- 💬 **Real-time Messaging** - Instant message delivery using WebSocket (Socket.IO)
- 👥 **Contact List** - View all registered users
- 🟢 **Online Status** - Real-time online/offline status tracking
- ⌨️ **Typing Indicators** - See when someone is typing
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🌙 **Dark Mode** - Beautiful WhatsApp-inspired dark theme
- ✨ **Modern UI** - Smooth animations and glassmorphism effects
- 📝 **Message History** - Persistent message storage in MongoDB
- 🔍 **Search Contacts** - Quick contact search functionality

## 🛠️ Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **Socket.IO** - Real-time bidirectional communication
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables
- **JavaScript (ES6+)** - Client-side logic
- **Socket.IO Client** - WebSocket client

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5.0 or higher) - [Download](https://www.mongodb.com/try/download/community)
  - Or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free cloud database)
- **npm** or **yarn** - Package manager (comes with Node.js)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd antigravity
```

### 2. Install Dependencies

```bash
cd server
npm install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/whatsapp-clone
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5000
```

**For MongoDB Atlas**, use this format:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/whatsapp-clone
```

### 4. Start MongoDB (if running locally)

```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
```

### 5. Run the Application

```bash
cd server
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The application will be available at: **http://localhost:5000**

## 📖 Usage

### Creating an Account

1. Open http://localhost:5000 in your browser
2. Click "Sign up" on the login page
3. Enter your username, email, and password
4. Click "Sign Up"

### Sending Messages

1. After logging in, you'll see a list of contacts on the left
2. Click on any contact to open a chat
3. Type your message in the input field at the bottom
4. Press Enter or click the send button

### Testing Real-time Features

1. Open the application in two different browsers or incognito windows
2. Register two different accounts
3. Send messages between them to see real-time delivery
4. Watch online status and typing indicators update in real-time

## 📁 Project Structure

```
antigravity/
├── server/
│   ├── models/
│   │   ├── User.js           # User schema
│   │   ├── Message.js        # Message schema
│   │   └── Conversation.js   # Conversation schema
│   ├── routes/
│   │   ├── auth.js           # Authentication routes
│   │   ├── users.js          # User routes
│   │   └── messages.js       # Message routes
│   ├── middleware/
│   │   └── auth.js           # JWT authentication middleware
│   ├── socket/
│   │   └── handlers.js       # Socket.IO event handlers
│   ├── server.js             # Main server file
│   ├── package.json          # Dependencies
│   └── .env                  # Environment variables
├── client/
│   ├── css/
│   │   └── styles.css        # Complete styling
│   ├── js/
│   │   ├── api.js            # API utilities
│   │   ├── socket.js         # Socket.IO manager
│   │   ├── auth.js           # Authentication manager
│   │   ├── chat.js           # Chat manager
│   │   └── app.js            # Main application
│   └── index.html            # Main HTML file
├── .gitignore
├── README.md
└── DEPLOYMENT.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Users
- `GET /api/users` - Get all users (protected)
- `GET /api/users/:id` - Get specific user (protected)
- `PUT /api/users/profile` - Update profile (protected)

### Messages
- `GET /api/messages/:userId` - Get conversation with user (protected)
- `POST /api/messages` - Send message (protected)
- `PUT /api/messages/:id/read` - Mark message as read (protected)
- `GET /api/messages/conversations/all` - Get all conversations (protected)

### Health Check
- `GET /api/health` - Server health check

## 🔄 Socket.IO Events

### Client → Server
- `user:connect` - User connects with userId
- `message:send` - Send a message
- `typing:start` - Start typing indicator
- `typing:stop` - Stop typing indicator
- `message:read` - Mark message as read

### Server → Client
- `message:receive` - Receive new message
- `message:sent` - Message sent confirmation
- `user:status` - User online/offline status update
- `typing:display` - Display typing indicator
- `message:read:confirm` - Message read confirmation
- `message:error` - Error occurred

## 🚢 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions for various platforms:
- Heroku
- DigitalOcean
- AWS
- Railway
- Render

## 🔒 Security Considerations

- Passwords are hashed using bcryptjs
- JWT tokens for secure authentication
- Environment variables for sensitive data
- Input validation on all endpoints
- CORS configuration for production
- XSS protection in message rendering

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB service
sudo systemctl start mongod
```

### Port Already in Use
```bash
# Change PORT in .env file
PORT=3000
```

### Socket.IO Connection Failed
- Check CORS settings in server.js
- Ensure CLIENT_URL in .env matches your frontend URL
- Check firewall settings

## 📝 License

MIT License - feel free to use this project for learning or production!

## 👨‍💻 Author

Built with ❤️ using Node.js, Express, Socket.IO, and MongoDB

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

**Happy Messaging! 💬**
