# Deployment Guide - WhatsApp Clone

This guide provides step-by-step instructions for deploying your WhatsApp Clone application to various hosting platforms.

## 📋 Pre-Deployment Checklist

- [ ] Test application locally
- [ ] Set up MongoDB database (local or cloud)
- [ ] Configure environment variables
- [ ] Update CORS settings for production domain
- [ ] Test with multiple users
- [ ] Ensure all dependencies are in package.json

## 🗄️ Database Setup (MongoDB Atlas)

MongoDB Atlas provides a free cloud database perfect for production.

### 1. Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (free tier available)

### 2. Configure Database

1. Click "Connect" on your cluster
2. Add your IP address to whitelist (or allow access from anywhere: 0.0.0.0/0)
3. Create a database user with username and password
4. Get your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/whatsapp-clone
   ```

### 3. Update Environment Variables

Replace `MONGODB_URI` in your `.env` with the Atlas connection string.

---

## 🚀 Deployment Options

## Option 1: Heroku

Heroku is a popular PaaS that makes deployment simple.

### Prerequisites
- Heroku account ([Sign up](https://signup.heroku.com/))
- Heroku CLI ([Install](https://devcenter.heroku.com/articles/heroku-cli))

### Steps

1. **Login to Heroku**
   ```bash
   heroku login
   ```

2. **Create Heroku App**
   ```bash
   cd server
   heroku create whatsapp-clone-yourname
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set MONGODB_URI="your-mongodb-atlas-uri"
   heroku config:set JWT_SECRET="your-secret-key"
   heroku config:set NODE_ENV="production"
   heroku config:set CLIENT_URL="https://whatsapp-clone-yourname.herokuapp.com"
   ```

4. **Deploy**
   ```bash
   git init
   git add .
   git commit -m "Initial deployment"
   git push heroku main
   ```

5. **Open Application**
   ```bash
   heroku open
   ```

### Heroku Configuration

Create `Procfile` in server directory:
```
web: node server.js
```

Update `package.json` to specify Node version:
```json
{
  "engines": {
    "node": "16.x"
  }
}
```

---

## Option 2: Railway

Railway offers simple deployment with automatic HTTPS.

### Steps

1. **Sign up** at [Railway.app](https://railway.app/)

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository

3. **Configure Environment Variables**
   - Go to Variables tab
   - Add:
     - `MONGODB_URI`
     - `JWT_SECRET`
     - `NODE_ENV=production`
     - `PORT=5000`

4. **Deploy**
   - Railway automatically deploys on git push
   - Get your deployment URL from the dashboard

---

## Option 3: Render

Render provides free hosting with automatic SSL.

### Steps

1. **Sign up** at [Render.com](https://render.com/)

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the server directory

3. **Configure Service**
   - **Name**: whatsapp-clone
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: Free

4. **Add Environment Variables**
   ```
   MONGODB_URI=your-mongodb-uri
   JWT_SECRET=your-secret-key
   NODE_ENV=production
   CLIENT_URL=https://your-app.onrender.com
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Render automatically deploys

---

## Option 4: DigitalOcean App Platform

DigitalOcean offers robust hosting with good performance.

### Steps

1. **Sign up** at [DigitalOcean](https://www.digitalocean.com/)

2. **Create App**
   - Go to Apps → Create App
   - Connect GitHub repository
   - Select server directory

3. **Configure**
   - **Name**: whatsapp-clone
   - **Type**: Web Service
   - **Build Command**: `npm install`
   - **Run Command**: `node server.js`

4. **Environment Variables**
   Add all required variables in the Environment section

5. **Deploy**
   - Review and create
   - App deploys automatically

---

## Option 5: AWS (EC2)

For more control, deploy on AWS EC2.

### Steps

1. **Launch EC2 Instance**
   - Choose Ubuntu Server
   - Select t2.micro (free tier)
   - Configure security group (ports 22, 80, 443, 5000)

2. **Connect to Instance**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

3. **Install Dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt install -y nodejs

   # Install MongoDB (optional if using Atlas)
   wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
   sudo apt update
   sudo apt install -y mongodb-org
   sudo systemctl start mongod
   sudo systemctl enable mongod

   # Install PM2 (process manager)
   sudo npm install -g pm2
   ```

4. **Clone and Setup Application**
   ```bash
   git clone your-repo-url
   cd antigravity/server
   npm install
   ```

5. **Create .env File**
   ```bash
   nano .env
   # Add your environment variables
   ```

6. **Start Application with PM2**
   ```bash
   pm2 start server.js --name whatsapp-clone
   pm2 startup
   pm2 save
   ```

7. **Configure Nginx (Optional)**
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/whatsapp-clone
   ```

   Add configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/whatsapp-clone /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

8. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

## Option 6: VPS (DigitalOcean Droplet, Linode, Vultr)

Similar to AWS EC2 but often simpler.

### Steps

1. **Create Droplet/VPS**
   - Choose Ubuntu 20.04
   - Select plan ($5/month minimum)
   - Add SSH key

2. **Follow AWS EC2 steps 2-8** above

---

## 🔒 Production Best Practices

### 1. Environment Variables
Never commit `.env` files. Always use platform-specific environment variable management.

### 2. HTTPS/SSL
Always use HTTPS in production:
- Most platforms provide automatic SSL
- For custom domains, use Let's Encrypt

### 3. CORS Configuration
Update `server.js` CORS settings:
```javascript
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
```

### 4. Database Security
- Use strong passwords
- Whitelist specific IPs when possible
- Enable MongoDB authentication
- Regular backups

### 5. Monitoring
- Set up error logging (e.g., Sentry)
- Monitor server health
- Set up uptime monitoring (e.g., UptimeRobot)

### 6. Performance
- Enable gzip compression
- Use CDN for static assets
- Implement rate limiting
- Database indexing

---

## 🔍 Troubleshooting Deployment

### WebSocket Connection Issues
- Ensure WebSocket support is enabled on your platform
- Check firewall/security group settings
- Verify CORS configuration

### Database Connection Fails
- Check MongoDB Atlas IP whitelist
- Verify connection string format
- Ensure database user has correct permissions

### Application Crashes
- Check logs: `heroku logs --tail` or platform-specific logs
- Verify all environment variables are set
- Check Node.js version compatibility

### Port Issues
- Most platforms assign PORT automatically
- Use `process.env.PORT || 5000`

---

## 📊 Post-Deployment

### Testing
1. Register multiple test accounts
2. Test real-time messaging
3. Verify online status updates
4. Test on mobile devices
5. Check typing indicators

### Monitoring
- Set up application monitoring
- Configure error tracking
- Monitor database performance
- Track user metrics

---

## 🎉 Congratulations!

Your WhatsApp Clone is now live! Share the URL with friends and start messaging!

For issues or questions, check the main README.md or create an issue on GitHub.
