# LJ Services Group - Management Dashboard

> **Complete property management system with Microsoft Azure authentication and Firebase real-time database**

## 🎯 Features

### Core Functionality
- ✅ **Microsoft Azure Authentication** - Secure login with Microsoft accounts
- ✅ **Firebase Real-time Database** - Multi-device synchronization
- ✅ **3 Main Dashboards** - Tickets, Work Orders, Violations
- ✅ **19 LJ Services Associations** - All properties managed
- ✅ **Professional UI** - Modern, clean, responsive design
- ✅ **Mobile Responsive** - Works on phone, tablet, desktop

### Dashboard Features
1. **Tickets Management**
   - Create, view, edit tickets
   - Filter by status, association
   - Search functionality
   - Priority levels (High, Medium, Low)
   - Real-time updates

2. **Work Orders Management**
   - Maintenance tracking
   - Work order types (Maintenance, Repair, Inspection, Emergency)
   - Status tracking
   - Association filtering

3. **Violations Management**
   - 4-step notice process (1st Notice, 2nd Notice, 3rd Notice, Hearing Letter)
   - Homeowner tracking
   - Unit/Address tracking
   - Violation type categorization
   - PDF letter generation (future enhancement)

## 📋 19 LJ Services Associations

1. Anthony Gardens (ANT)
2. Bayshore Treasure Condominium (BTC)
3. Cambridge (CAM)
4. Eastside Condominium (EAST)
5. Enclave Waterside Villas (EWVCA)
6. Futura Sansovino (FSCA)
7. Island Point South (IPSCA)
8. Michelle Condominium (MICH)
9. Monterrey Condominium (MTC)
10. Normandy Shores (NORM)
11. Oxford Gates (OX)
12. Palms Of Sunset (POSS)
13. Patricia Condominium (PAT)
14. Ritz Royal (RITZ)
15. Sage Condominium (SAGE)
16. The Niche (NICHE)
17. Tower Gates (TWG)
18. Vizcaya Villas (VVC)
19. Wilton Terrace (WTC)

## 🚀 Quick Start

### Files Included
1. `index.html` - Main application file
2. `firebase-config.js` - Firebase configuration
3. `app.js` - Main application logic
4. `README.md` - This file

### Deployment Options

#### Option 1: GitHub Pages (Recommended)
1. Create a new GitHub repository
2. Upload all 3 files to the repository
3. Go to Settings → Pages
4. Select "main" branch as source
5. Your site will be live at: `https://yourusername.github.io/repository-name/`

#### Option 2: Local Testing
1. Open Terminal/Command Prompt
2. Navigate to the folder containing the files
3. Run: `python -m http.server 8000`
4. Open browser to: `http://localhost:8000`

#### Option 3: Any Web Host
Upload all 3 files to any web hosting service (Netlify, Vercel, etc.)

## 🔐 Azure Setup (Required)

### Step 1: Create Azure App Registration
1. Go to https://portal.azure.com
2. Navigate to "Azure Active Directory"
3. Click "App registrations" → "New registration"
4. Name: "LJ Services Dashboard"
5. Redirect URI: Your deployment URL (e.g., `https://yourusername.github.io/repository-name/`)
6. Click "Register"

### Step 2: Note Your Client ID
Copy the "Application (client) ID" - you'll need this

### Step 3: Configure Authentication
1. In your app registration, click "Authentication"
2. Under "Single-page application", add your redirect URI
3. Enable "ID tokens" under "Implicit grant and hybrid flows"
4. Save

### Step 4: API Permissions
1. Click "API permissions"
2. Add permissions:
   - Microsoft Graph → `User.Read`
   - Microsoft Graph → `email`
   - Microsoft Graph → `openid`
   - Microsoft Graph → `profile`
3. Click "Grant admin consent"

## 🔥 Firebase Setup (Already Configured)

Your Firebase is already set up with these credentials:
- Project: `lj-services-group`
- Database URL: `https://lj-services-group-default-rtdb.firebaseio.com`
- Auth Domain: `lj-services-group.firebaseapp.com`

### Firebase Database Rules (Already Applied)
```json
{
  "rules": {
    "tickets": {
      ".read": true,
      ".write": true
    },
    "workOrders": {
      ".read": true,
      ".write": true
    },
    "violations": {
      ".read": true,
      ".write": true
    }
  }
}
```

## 💻 Usage Guide

### Login
1. Navigate to your deployed URL
2. Click "Sign in with Microsoft"
3. Login with your Microsoft account
4. Dashboard loads automatically

### Creating Tickets
1. Navigate to "Tickets" page
2. Click "New Ticket" button
3. Fill in form:
   - **Title** (required)
   - **Association** (required)
   - **Priority** (required)
   - **Status** (required)
   - **Description** (optional)
4. Click "Create Ticket"
5. Ticket appears instantly and syncs to Firebase

### Creating Work Orders
1. Navigate to "Work Orders" page
2. Click "New Work Order" button
3. Fill in form:
   - **Title** (required)
   - **Association** (required)
   - **Type** (required)
   - **Status** (required)
   - **Description** (optional)
4. Click "Create Work Order"

### Creating Violations
1. Navigate to "Violations" page
2. Click "New Violation" button
3. Fill in form:
   - **Homeowner Name** (required)
   - **Association** (required)
   - **Unit/Address** (required)
   - **Violation Type** (required)
   - **Current Step** (required) - 1st, 2nd, 3rd Notice, or Hearing Letter
   - **Description** (optional)
4. Click "Create Violation"

### Filtering and Search
- Use dropdown filters to filter by status, association, step
- Use search boxes to search by text
- Filters apply in real-time

## 📱 Mobile Usage

The dashboard is fully responsive:
- **Hamburger menu** button appears on mobile
- **Tap** to open sidebar
- **Tap outside** or overlay to close
- All features work on mobile devices

## 🔄 Real-time Sync

All data syncs across devices automatically:
1. Create ticket on Device A
2. Device B sees it instantly (no refresh needed)
3. Update on Device B
4. Device A sees the update immediately

## 🛠️ Customization

### Adding More Associations
Edit `app.js`, find the `ASSOCIATIONS` array:
```javascript
const ASSOCIATIONS = [
    "Anthony Gardens (ANT)",
    "Your New Association",
    // ... add more
];
```

### Changing Colors
Edit the CSS in `index.html`:
```css
/* Main gradient colors */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Adding Features
The modular code structure makes it easy to add:
- Custom fields
- New dashboards
- Additional filters
- PDF generation
- Email notifications

## 📊 Data Structure

### Tickets
```javascript
{
  id: "unique-id",
  title: "Fix AC Unit",
  association: "Atlantic III",
  priority: "high",
  status: "open",
  description: "AC not working in unit 305",
  createdBy: "Kevin Rodriguez",
  createdAt: "2025-11-17T...",
  updatedAt: "2025-11-17T..."
}
```

### Work Orders
```javascript
{
  id: "unique-id",
  title: "HVAC Maintenance",
  association: "Bayshore Treasure Condominium (BTC)",
  type: "maintenance",
  status: "pending",
  description: "Quarterly HVAC inspection",
  createdBy: "Linda Johnson",
  createdAt: "2025-11-17T...",
  updatedAt: "2025-11-17T..."
}
```

### Violations
```javascript
{
  id: "unique-id",
  homeowner: "John Smith",
  association: "Cambridge (CAM)",
  unit: "Unit 402",
  violationType: "Parking violation",
  step: 1,
  description: "Unauthorized vehicle in visitor parking",
  createdBy: "Kevin Rodriguez",
  createdAt: "2025-11-17T...",
  updatedAt: "2025-11-17T...",
  status: "active"
}
```

## 🐛 Troubleshooting

### Login Not Working
1. Check Azure redirect URI matches deployment URL exactly
2. Verify API permissions are granted
3. Clear browser cache and try again

### Data Not Syncing
1. Check Firebase Rules are set correctly
2. Open browser console for errors
3. Verify internet connection

### Page Not Loading
1. Check all 3 files are in same directory
2. Verify no browser errors (F12 console)
3. Try hard refresh (Ctrl+Shift+R)

## 🔒 Security Notes

- Firebase rules currently allow all read/write for testing
- For production, implement proper Firebase authentication rules
- Keep Azure Client ID secure
- Don't commit sensitive credentials to public repositories

## 📈 Future Enhancements

### Planned Features
- [ ] PDF generation for violation letters
- [ ] Email notifications
- [ ] Image attachments
- [ ] Comments/notes system
- [ ] Activity timeline
- [ ] Advanced reporting
- [ ] Export to CSV
- [ ] Print functionality
- [ ] Dark mode
- [ ] Notification system

## 📞 Support

For issues or questions:
1. Check this README
2. Review browser console errors
3. Check Firebase database directly
4. Verify Azure app registration settings

## 📝 Version History

### Version 1.0.0 (November 17, 2025)
- Initial release
- Microsoft Azure authentication
- Firebase real-time database
- Tickets, Work Orders, Violations management
- 19 LJ Services associations
- Mobile responsive design
- Real-time multi-device sync

---

© 2025 LJ Services Group. All rights reserved.

**Built with:** HTML5, CSS3, JavaScript, Firebase, Azure AD
