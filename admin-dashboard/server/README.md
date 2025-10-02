# Transportify Admin Server

A secure Node.js server for the Transportify admin dashboard with authentication and API endpoints.

## Features

### 🔐 **Authentication**
- **Secure Login**: Username/password authentication
- **Session Management**: Express sessions with secure cookies
- **Protected Routes**: All admin routes require authentication
- **Auto-redirect**: Unauthenticated users redirected to login

### 🚚 **Admin Dashboard**
- **Shipment Management**: Create, read, update, delete shipments
- **Real-time Updates**: Live data synchronization
- **Interactive Map**: Mapbox integration with shipment markers
- **Statistics**: Live dashboard with shipment counts

### 🛡️ **Security**
- **Helmet**: Security headers and CSP
- **Rate Limiting**: Protection against brute force attacks
- **CORS**: Configured for your main application
- **Session Security**: HttpOnly cookies, secure in production

## Quick Start

### 1. **Install Dependencies**
```bash
cd admin-server
npm install
```

### 2. **Configure Environment**
Edit `config.js` to set your preferences:
- Change default admin credentials
- Set session secret
- Configure Firebase (optional)

### 3. **Start the Server**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 4. **Access Admin Dashboard**
- **Server**: http://localhost:3001
- **Login**: http://localhost:3001/admin/login
- **Dashboard**: http://localhost:3001/admin/dashboard

### 5. **Default Credentials**
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Change these credentials in production!**

## API Endpoints

### **Authentication**
- `POST /admin/login` - Login with credentials
- `POST /admin/logout` - Logout and destroy session
- `GET /admin/check-auth` - Check authentication status

### **Shipments**
- `GET /admin/api/shipments` - Get all shipments
- `POST /admin/api/shipments` - Create new shipment
- `PUT /admin/api/shipments/:id` - Update shipment
- `DELETE /admin/api/shipments/:id` - Delete shipment

### **Static Files**
- `GET /admin/*` - Serve admin dashboard files
- `GET /admin/login` - Login page
- `GET /admin/dashboard` - Protected dashboard

## Configuration

### **Environment Variables**
Create a `.env` file (optional):
```env
PORT=3001
NODE_ENV=development
SESSION_SECRET=your-super-secret-session-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### **Firebase Integration**
To enable Firebase (optional):
1. Add your Firebase Admin SDK credentials to `config.js`
2. Uncomment Firebase initialization in `server.js`
3. Replace mock database with Firebase Firestore

## Security Features

### **Rate Limiting**
- 100 requests per 15 minutes per IP
- Configurable in `server.js`

### **Content Security Policy**
- Strict CSP headers via Helmet
- Allows necessary external resources
- Blocks inline scripts (except necessary ones)

### **Session Security**
- HttpOnly cookies
- Secure flag in production
- 24-hour session timeout
- CSRF protection ready

## File Structure

```
admin-server/
├── server.js           # Main server file
├── config.js           # Configuration
├── package.json        # Dependencies
└── README.md          # This file
```

## Development

### **Running in Development**
```bash
npm run dev
```
Uses nodemon for auto-restart on file changes.

### **Production Deployment**
1. Set `NODE_ENV=production`
2. Use a process manager like PM2
3. Set up reverse proxy (nginx)
4. Enable HTTPS
5. Change default credentials

## Integration with Main App

The admin server is designed to work alongside your main Transportify application:

1. **Main App**: Runs on port 3000 or 5173 (Vite)
2. **Admin Server**: Runs on port 3001
3. **CORS**: Configured to allow requests from main app

## Troubleshooting

### **Port Already in Use**
```bash
# Kill process on port 3001
npx kill-port 3001

# Or change port in config.js
```

### **Authentication Issues**
- Check session secret is set
- Verify credentials in config
- Clear browser cookies/cache

### **Map Not Loading**
- Get Mapbox token from mapbox.com
- Update token in admin/script.js
- Check CSP allows Mapbox resources

## Security Checklist

- [ ] Change default admin credentials
- [ ] Set strong session secret
- [ ] Enable HTTPS in production
- [ ] Configure firewall rules
- [ ] Set up monitoring/logging
- [ ] Regular security updates
- [ ] Backup database regularly

## Support

For issues or questions:
1. Check the console logs
2. Verify all dependencies installed
3. Check network connectivity
4. Review configuration settings

## License

MIT License - See LICENSE file for details.
