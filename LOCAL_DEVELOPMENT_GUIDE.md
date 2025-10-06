# 🚀 Local Development Setup Guide

## 🎯 What This Setup Provides

✅ **Completely Isolated Environment** - No interference with production  
✅ **SQLite Database** - No PostgreSQL required for local development  
✅ **Local File Storage** - Images stored locally, no Cloudinary needed  
✅ **Sample Data** - Pre-populated with medieval commanders  
✅ **Admin Interface Testing** - Test your features without affecting production  
✅ **Persistent Data** - Data survives server restarts  

## 📋 Prerequisites

- Node.js (v18+)
- npm
- Your existing project files

## 🔧 Quick Setup

### Step 1: Setup Local Environment

```bash
# Navigate to server directory
cd server

# Run the automated setup script
npm run setup:local
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
🚀 Local Development Server Running
=====================================
📍 Server: http://localhost:5001
📁 Uploads: /path/to/uploads
🗄️ Database: SQLite (./dev.db)
🔧 Environment: Local Development
```

### Step 3: Start Frontend

```bash
# In a new terminal, navigate to project root
cd /Users/yavuzselim/Desktop/MedCom

# Start frontend development server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

## 🧪 Testing Your Features

### 1. **Test Admin Panel**

1. Open `http://localhost:5173`
2. Navigate to Admin Panel
3. **Check for**:
   - ✅ Sample cards are loaded
   - ✅ Image upload works (stored locally)
   - ✅ Card management functions
   - ✅ Proposal approval/rejection

### 2. **Test Image Upload**

1. Click "Create New Card" or submit a proposal
2. Upload an image and fill out the form
3. **Check for**:
   - ✅ Image preview shows correctly
   - ✅ Image is stored in `server/uploads/` directory
   - ✅ Image URL is accessible at `http://localhost:5001/uploads/filename`

### 3. **Test Database Operations**

1. Create, update, delete cards
2. Submit and manage proposals
3. **Check for**:
   - ✅ All operations work smoothly
   - ✅ Data persists after server restart
   - ✅ No external dependencies required

## 📁 Local Development Structure

```
server/
├── dev.db                    # SQLite database file
├── uploads/                  # Local image storage
├── schema.local.prisma       # Local Prisma schema
├── index-local.js           # Local development server
├── prisma-local.js          # Local Prisma client
├── seed-local.js            # Sample data seeder
├── setup-local.sh           # Setup script
└── env.local.example        # Environment template
```

## 🔧 Available Commands

### Server Commands (in `server/` directory)
```bash
npm run dev:local          # Start local development server
npm run setup:local        # Setup local environment
npm run seed:local         # Seed database with sample data
```

### Root Commands (in project root)
```bash
npm run db:generate:local  # Generate Prisma client for local
npm run db:push:local      # Push schema to local database
npm run db:setup:local     # Setup local environment
```

## 🌐 API Endpoints (Local)

All endpoints work the same as production, but with local storage:

- `GET /api/health` - Health check
- `GET /api/cards` - Get all approved cards
- `GET /api/admin/cards` - Get all cards (admin)
- `POST /api/admin/cards` - Create card (admin)
- `PUT /api/admin/cards/:id` - Update card (admin)
- `DELETE /api/admin/cards/:id` - Delete card (admin)
- `GET /api/admin/proposals` - Get all proposals (admin)
- `POST /api/proposals` - Submit proposal
- `POST /api/admin/proposals/:id/approve` - Approve proposal (admin)
- `POST /api/admin/proposals/:id/reject` - Reject proposal (admin)

## 🔑 Default Admin Access

- **Email**: `admin@medievalcommanders.com`
- **Access**: Full admin panel access

## 💡 Key Benefits

1. **Complete Isolation**: No risk of affecting production data
2. **Fast Setup**: No external services required
3. **Persistent Data**: Your work survives server restarts
4. **Easy Testing**: Test all features without production constraints
5. **Offline Development**: Works without internet connection

## 🚨 Important Notes

- **Local Only**: This setup is for development only
- **Data Persistence**: Data is stored in `dev.db` file
- **File Storage**: Images are stored in `uploads/` directory
- **No Cloudinary**: Uses local file serving instead
- **No PostgreSQL**: Uses SQLite instead

## 🔄 Resetting Local Environment

To start fresh:

```bash
cd server
rm -f dev.db
rm -rf uploads/*
npm run setup:local
```

## 🐛 Troubleshooting

### Database Connection Issues
```bash
cd server
npm run setup:local
```

### Missing Dependencies
```bash
cd server
npm install
```

### Port Already in Use
Change the port in `server/.env`:
```
PORT=5002
```

### Image Upload Issues
Check that `uploads/` directory exists and is writable:
```bash
cd server
mkdir -p uploads
chmod 755 uploads
```

## 🎉 You're Ready!

Your local development environment is now completely isolated from production. You can:

- Develop new features safely
- Test database operations
- Upload and manage images locally
- Work offline
- Restart the environment anytime

Happy coding! 🚀
