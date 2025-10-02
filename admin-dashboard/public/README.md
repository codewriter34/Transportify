# Transportify Admin Dashboard

A fully functional HTML-based admin dashboard for managing shipments and tracking logistics operations.

## Features

### 🚚 **Shipment Management**
- **Add New Shipments**: Complete form with sender, destination, weight, dimensions, and ETA
- **Auto-Generated Tracking IDs**: Unique tracking numbers in format `TRK-XXXXXXXXXX`
- **Real-time Updates**: Live updates when new shipments are added
- **Form Validation**: Comprehensive validation with error messages

### 🗺️ **Interactive Map**
- **Mapbox Integration**: Visual representation of all shipments
- **Custom Markers**: Color-coded markers based on shipment status
- **Interactive Popups**: Click markers to view shipment details
- **Auto-fit View**: Map automatically adjusts to show all shipments

### 📊 **Dashboard Analytics**
- **Live Statistics**: Real-time counts of total, in-transit, pending, and delivered shipments
- **Status Tracking**: Visual status badges with color coding
- **Performance Metrics**: Track delivery performance and operations

### 📋 **Shipments Table**
- **Complete Shipment List**: View all shipments in a sortable table
- **Quick Actions**: Edit and delete shipments with confirmation
- **Copy Tracking IDs**: One-click copy functionality
- **Responsive Design**: Works on all device sizes

## Setup Instructions

### 1. **Mapbox Configuration**
1. Sign up for a free account at [Mapbox](https://www.mapbox.com/)
2. Get your access token from the dashboard
3. Replace the placeholder token in `script.js`:
   ```javascript
   mapboxgl.accessToken = 'YOUR_MAPBOX_TOKEN_HERE';
   ```

### 2. **Firebase Configuration**
The dashboard is already configured to use your existing Firebase project:
- Project ID: `transportify-d94c3`
- Configuration is in `firebase-config.js`

### 3. **Running the Dashboard**
1. Open `admin/index.html` in a web browser
2. Or serve it using a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server
   ```
3. Navigate to `http://localhost:8000/admin/`

## File Structure

```
admin/
├── index.html          # Main dashboard page
├── styles.css          # Custom CSS with corporate palette
├── script.js           # Main JavaScript functionality
├── firebase-config.js  # Firebase configuration
├── utils.js            # Utility functions
└── README.md           # This file
```

## Color Palette

The dashboard uses the professional corporate color scheme:

- **Primary Navy**: `#1E3A8A` - Headings and primary elements
- **Secondary Sky Blue**: `#3B82F6` - Accents and interactive elements
- **Background White**: `#FFFFFF` - Clean background
- **Text Gray**: `#374151` - Body text and secondary information
- **Accent Lime Green**: `#84CC16` - Call-to-action buttons and highlights

## Key Functions

### **Form Submission**
- Validates all required fields
- Generates unique tracking IDs
- Geocodes addresses for map display
- Shows success/error notifications

### **Real-time Updates**
- Firebase Firestore integration for live data
- Automatic map marker updates
- Statistics refresh in real-time
- Table updates without page reload

### **Map Features**
- Interactive markers with shipment details
- Status-based color coding
- Popup information on marker click
- Auto-fit view to show all shipments

### **Data Management**
- CRUD operations for shipments
- Export functionality (CSV)
- Copy tracking IDs to clipboard
- Delete with confirmation

## Browser Compatibility

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support

## Dependencies

- **Tailwind CSS**: For styling and layout
- **Mapbox GL JS**: For interactive maps
- **Firebase**: For real-time database
- **Lucide Icons**: For UI icons

## Security Notes

- The dashboard uses client-side Firebase configuration
- For production use, implement proper authentication
- Consider using Firebase Admin SDK for server-side operations
- Validate all data on both client and server side

## Customization

### **Adding New Fields**
1. Update the form in `index.html`
2. Modify the validation in `utils.js`
3. Update the table display in `script.js`

### **Changing Colors**
1. Update CSS variables in `styles.css`
2. Modify Tailwind classes in `index.html`

### **Adding New Features**
1. Extend the utility functions in `utils.js`
2. Add new event listeners in `script.js`
3. Update the UI in `index.html`

## Troubleshooting

### **Map Not Loading**
- Check your Mapbox token
- Ensure you have an active Mapbox account
- Verify internet connection

### **Firebase Errors**
- Check Firebase configuration
- Ensure Firestore is enabled
- Verify project permissions

### **Form Not Submitting**
- Check browser console for errors
- Verify all required fields are filled
- Ensure Firebase connection is working

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.
