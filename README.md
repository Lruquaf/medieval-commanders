# Medieval Commanders Collection

A web application for collecting and managing medieval commander cards with a proposal system for adding new cards.

## Features

- **Card Gallery**: View all approved commander cards
- **Proposal System**: Submit new commander cards for review
- **Admin Panel**: Approve/reject proposals and manage cards
- **Image Upload**: Upload commander images with validation
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React, Vite, React Router
- **Backend**: Node.js, Express.js
- **Database**: SQLite (development) / PostgreSQL (production)
- **File Upload**: Multer for image handling
- **Styling**: CSS3 with modern design

## 🚀 Quick Deploy

### Option 1: Deploy Everything for Free

1. **Backend (Railway)**: 
   - Connect your GitHub repo to [Railway](https://railway.app)
   - Railway will auto-deploy your backend with PostgreSQL database
   - Get your backend URL (e.g., `https://your-app.railway.app`)

2. **Frontend (Vercel)**:
   - Connect your GitHub repo to [Vercel](https://vercel.com)
   - Set environment variable: `VITE_API_URL=https://your-app.railway.app`
   - Vercel will auto-deploy your frontend

### Option 2: Deploy Everything for Free (Alternative)

1. **Backend (Railway)**: Same as above
2. **Frontend (Netlify)**:
   - Connect your GitHub repo to [Netlify](https://netlify.com)
   - Set environment variable: `VITE_API_URL=https://your-app.railway.app`
   - Netlify will auto-deploy your frontend

## 🛠️ Local Development

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd medieval-commanders-collection
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
# Edit .env with your settings
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Start the development server:
```bash
npm run dev
```

6. Start the backend server (in a new terminal):
```bash
npm run server
```

The application will be available at `http://localhost:3000`.

## 📁 Project Structure

```
├── src/
│   ├── components/          # Reusable React components
│   ├── pages/              # Page components
│   ├── config/             # API configuration
│   └── main.jsx           # Application entry point
├── server/                 # Backend Express server
├── prisma/                # Database schema and migrations
├── public/                # Static assets
├── railway.json           # Railway deployment config
├── vercel.json            # Vercel deployment config
└── env.example            # Environment variables template
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="file:./dev.db"  # For development
# DATABASE_URL="postgresql://..."  # For production (Railway provides this)

# Server
PORT=5001
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:5001  # For development
# VITE_API_URL=https://your-app.railway.app  # For production
```

## 🌐 API Endpoints

### Cards
- `GET /api/cards` - Get all approved cards
- `POST /api/admin/cards` - Create a new card (admin only)
- `PUT /api/admin/cards/:id` - Update a card (admin only)
- `DELETE /api/admin/cards/:id` - Delete a card (admin only)

### Proposals
- `POST /api/proposals` - Submit a new proposal
- `GET /api/admin/proposals` - Get all proposals (admin only)
- `POST /api/admin/proposals/:id/approve` - Approve a proposal (admin only)
- `POST /api/admin/proposals/:id/reject` - Reject a proposal (admin only)

### Health Check
- `GET /api/health` - Server health status

## 🗄️ Database Schema

### Card Model
- `id`: Unique identifier
- `name`: Commander name
- `email`: Submitter email (optional)
- `image`: Image file path
- `attributes`: JSON string of commander attributes
- `tier`: Card tier (Common, Rare, Epic, Legendary)
- `description`: Commander description
- `status`: Card status (approved by default)
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### Proposal Model
- `id`: Unique identifier
- `name`: Commander name
- `email`: Submitter email
- `image`: Image file path
- `attributes`: JSON string of commander attributes
- `tier`: Card tier
- `description`: Commander description
- `status`: Proposal status (pending by default)
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

## 🚀 Deployment Guide

### Railway (Backend)

1. Go to [Railway](https://railway.app) and sign up with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will automatically detect it's a Node.js app
5. Add a PostgreSQL database:
   - Go to your project dashboard
   - Click "New" → "Database" → "PostgreSQL"
6. Railway will provide a `DATABASE_URL` environment variable
7. Your backend will be deployed automatically

### Vercel (Frontend)

1. Go to [Vercel](https://vercel.com) and sign up with GitHub
2. Click "New Project" → Import your repository
3. Set build settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variable:
   - `VITE_API_URL` = your Railway backend URL
5. Click "Deploy"

### Netlify (Frontend Alternative)

1. Go to [Netlify](https://netlify.com) and sign up with GitHub
2. Click "New site from Git" → Connect your repository
3. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variable:
   - `VITE_API_URL` = your Railway backend URL
5. Click "Deploy site"

## 🔄 Updating CORS for Production

After deploying, update the CORS origins in `server/index.js`:

```javascript
origin: process.env.NODE_ENV === 'production' 
  ? ['https://your-frontend-domain.vercel.app', 'https://your-frontend-domain.netlify.app']
  : ['http://localhost:3000', 'http://localhost:5173'],
```

Replace `your-frontend-domain` with your actual deployed frontend URLs.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.