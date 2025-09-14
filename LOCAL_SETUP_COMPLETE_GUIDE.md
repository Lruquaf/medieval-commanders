# 🚀 Complete Local Development Setup Guide

## 🎯 What This Setup Provides

✅ **Isolated Local Environment** - Completely separate from production  
✅ **SQLite Database** - No PostgreSQL required for local development  
✅ **Local File Storage** - Images stored locally, no Cloudinary needed  
✅ **Sample Data** - Pre-populated with medieval commanders  
✅ **Admin Interface Testing** - Test your new card styling features  

## 📋 Prerequisites

- Node.js (v18+)
- npm
- Your existing project files

## 🔧 Setup Instructions

### Step 1: Setup Local Environment

```bash
# Navigate to server directory
cd /Users/yavuzselim/Desktop/Cursor/server

# Run the automated setup script
./setup-local.sh
```

This script will:
- Install all dependencies
- Create uploads directory
- Set up SQLite database
- Generate Prisma client
- Run database migrations
- Seed with sample data

### Step 2: Start Local Backend

```bash
# In the server directory
npm run dev:local
```

You should see:
```
🚀 Local development server running
📍 Server: http://localhost:5001
📁 Uploads: /path/to/uploads
🗄️ Database: SQLite (./dev.db)
🔧 Environment: Local Development
```

### Step 3: Start Frontend

```bash
# In a new terminal, navigate to project root
cd /Users/yavuzselim/Desktop/Cursor

# Start frontend development server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

## 🧪 Testing Your New Features

### 1. **Test Admin Card Grid Styling**

1. Open `http://localhost:5173`
2. Navigate to Admin Panel (use your admin credentials)
3. Go to "Manage Cards" tab
4. **Check for**:
   - ✅ Images fill square areas neatly
   - ✅ Hover over cards to see edit/delete buttons
   - ✅ Buttons appear below tier indicator
   - ✅ Smooth fade-in animations

### 2. **Test Image Upload**

1. Click "Create New Card"
2. Upload an image and fill out the form
3. **Check for**:
   - ✅ Image preview shows correctly
   - ✅ Card is created with proper square image
   - ✅ Image file is saved in `/server/uploads/`

### 3. **Test Edit/Delete Functionality**

1. Hover over any card in the admin grid
2. Click "Edit" or "Delete"
3. **Check for**:
   - ✅ Edit form pre-populates correctly
   - ✅ Image updates work properly
   - ✅ Delete removes card and image file

## 📁 Local Environment Structure

```
server/
├── index-local.js          # Local development server
├── prisma-local.js         # Local SQLite Prisma client
├── schema.local.prisma     # SQLite schema
├── seed-local.js           # Sample data seeder
├── setup-local.sh          # Automated setup script
├── env.local.example       # Environment template
├── uploads/                # Local image storage
└── dev.db                  # SQLite database file
```

## 🔍 Debugging & Monitoring

### Check Database Content
Visit: `http://localhost:5001/api/debug/cards`

This shows:
- Total cards in database
- Sample card data
- Environment info
- Storage configuration

### Check Health Status
Visit: `http://localhost:5001/api/health`

### Monitor Server Logs
The local server provides detailed logging:
- 📎 File upload events
- 🗄️ Database operations
- 🔧 Error messages
- ✅ Success confirmations

## 🛠️ Common Issues & Solutions

### Issue: "Permission denied" on setup script
```bash
chmod +x setup-local.sh
```

### Issue: Database migration fails
```bash
# Delete existing database and restart
rm dev.db
./setup-local.sh
```

### Issue: Frontend can't connect to backend
- Make sure backend is running on port 5001
- Check CORS configuration in `index-local.js`
- Verify frontend is pointing to `http://localhost:5001`

### Issue: Images not uploading
- Check `uploads/` directory exists and is writable
- Monitor server logs for error messages
- Verify file size is under 10MB

## 📊 Sample Data Included

The local setup includes:
- **5 Sample Cards**: Richard the Lionheart, William the Conqueror, Saladin, Alfred the Great, Joan of Arc
- **2 Sample Proposals**: Charlemagne, El Cid
- **All with proper attributes and descriptions**

## 🔄 Reset Local Environment

To start fresh:

```bash
# Delete database and uploads
rm dev.db
rm -rf uploads/*

# Re-run setup
./setup-local.sh
```

## 🚢 When Ready to Deploy

Your local changes are completely isolated. When you're satisfied:

1. **Test thoroughly** in local environment
2. **Commit changes**: `git add . && git commit -m "Admin styling improvements"`
3. **Push to repository**: `git push origin main`
4. **Deploy**: Your production deployment will update automatically

## 🔒 Production Safety

✅ **No production impact** - Local environment is completely isolated  
✅ **Different database** - SQLite vs. PostgreSQL  
✅ **Different storage** - Local files vs. Cloudinary  
✅ **Different configuration** - Separate environment variables  

Your live deployment continues running normally while you develop locally!

## 📞 Support

If you encounter issues:
1. Check the server logs for error messages
2. Verify all setup steps were completed
3. Try resetting the local environment
4. Check file permissions in the uploads directory

Happy coding! 🎉
