# 🚚 Transportify Admin Dashboard

A complete admin dashboard for managing shipments with authentication, interactive maps, and real-time updates.

## ✨ Features

### 🔐 **Authentication**
- Secure login system with sessions
- Protected routes and API endpoints
- Auto-redirect for unauthenticated users

### 🗺️ **Interactive Maps**
- **Free OpenStreetMap** (no credit card required!)
- Real-time shipment markers
- Click markers to view shipment details
- Automatic map fitting to show all shipments

### 📊 **Dashboard**
- Live statistics (total, in-transit, pending, delivered)
- Shipment management (create, view, delete)
- Responsive design with professional UI
- Real-time updates

### 🛡️ **Security**
- Rate limiting protection
- Secure session management
- CORS configuration
- Input validation

## 🚀 Quick Start

### **Option 1: Windows Setup (Recommended)**
1. Double-click `setup.bat`
2. Wait for dependencies to install
3. Follow the instructions shown

### **Option 2: Manual Setup**
```bash
# Navigate to server folder
cd admin-dashboard/server

# Install dependencies
npm install

# Start the server
npm start
```

### **Access the Dashboard**
- **URL**: http://localhost:3001/admin/login
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Change these credentials in production!**

## 📁 Project Structure

```
admin-dashboard/
├── server/                 # Node.js server
│   ├── server.js          # Main server file
│   ├── config.js          # Configuration
│   ├── package.json       # Dependencies
│   └── README.md          # Server documentation
├── public/                 # Frontend files
│   ├── index.html         # Admin dashboard
│   ├── login.html         # Login page
│   ├── script-leaflet.js  # Frontend logic (Leaflet)
│   ├── styles.css         # Styling
│   ├── utils.js           # Utility functions
│   └── firebase-config.js # Firebase config
├── setup.bat              # Windows setup script
└── README.md              # This file
```

## 🗺️ Map Features

### **OpenStreetMap Integration**
- **Free to use** - no API keys or credit cards required
- High-quality map tiles
- Responsive design
- Custom markers with status colors

### **Marker Colors**
- 🟡 **Pending**: Yellow
- 🔵 **In Transit**: Blue  
- 🟢 **Delivered**: Green
- 🔴 **Cancelled**: Red

### **Interactive Features**
- Click markers to view shipment details
- Automatic map fitting to show all shipments
- Geolocation support (if enabled)

## 🔧 Configuration

### **Server Settings**
Edit `server/config.js`:
```javascript
module.exports = {
    PORT: 3001,                    // Server port
    ADMIN_CREDENTIALS: {
        username: 'admin',          // Change this!
        password: 'admin123'        // Change this!
    },
    SESSION_SECRET: 'your-secret'   // Change this!
};
```

### **Default Credentials**
- **Username**: `admin`
- **Password**: `admin123`

## 🛡️ Security Features

### **Authentication**
- Session-based authentication
- Secure cookies (HttpOnly)
- Auto-logout on session expiry
- Protected API endpoints

### **Rate Limiting**
- 100 requests per 15 minutes per IP
- Prevents brute force attacks
- Configurable limits

### **Input Validation**
- Form validation on frontend
- Server-side validation
- XSS protection
- CSRF protection ready

## 📊 API Endpoints

### **Authentication**
- `POST /admin/login` - Login
- `POST /admin/logout` - Logout
- `GET /admin/check-auth` - Check auth status

### **Shipments**
- `GET /admin/api/shipments` - Get all shipments
- `POST /admin/api/shipments` - Create shipment
- `PUT /admin/api/shipments/:id` - Update shipment
- `DELETE /admin/api/shipments/:id` - Delete shipment

## 🎨 UI Features

### **Professional Design**
- Corporate color scheme (Blue + White + Gray + Lime)
- Responsive layout
- Clean typography
- Subtle animations

### **Components**
- Statistics cards
- Interactive data table
- Form validation
- Success/error notifications
- Loading states

## 🔄 Real-time Updates

- Live shipment tracking
- Automatic map updates
- Real-time statistics
- Session management

## 🚀 Production Deployment

### **Security Checklist**
- [ ] Change default admin credentials
- [ ] Set strong session secret
- [ ] Enable HTTPS
- [ ] Configure firewall
- [ ] Set up monitoring
- [ ] Regular backups

### **Environment Variables**
```bash
PORT=3001
NODE_ENV=production
SESSION_SECRET=your-strong-secret
ADMIN_USERNAME=your-username
ADMIN_PASSWORD=your-strong-password
```

## 🆘 Troubleshooting

### **Common Issues**

**Map not loading:**
- Check internet connection
- Verify Leaflet CDN is accessible
- Check browser console for errors

**Login not working:**
- Verify credentials in `config.js`
- Check server is running
- Clear browser cookies

**Port already in use:**
```bash
# Kill process on port 3001
npx kill-port 3001
```

### **Getting Help**
1. Check the console logs
2. Verify all dependencies installed
3. Check network connectivity
4. Review configuration settings

## 📝 License

MIT License - Feel free to use and modify!

## 🎯 What's Next?

- [ ] Add shipment editing functionality
- [ ] Implement user roles and permissions
- [ ] Add email notifications
- [ ] Export data to CSV/PDF
- [ ] Mobile app integration
- [ ] Advanced analytics

---

**Ready to manage your shipments? Start the server and login!** 🚀

