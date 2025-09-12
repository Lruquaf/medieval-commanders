# Netlify Deployment Guide

This guide explains how to deploy the Medieval Commanders Collection frontend to Netlify while using Railway for the backend.

## Prerequisites

1. A Railway account with the backend deployed
2. A Netlify account
3. Your Railway backend URL

## Deployment Steps

### 1. Connect Repository to Netlify

1. Go to [Netlify](https://netlify.com) and sign in
2. Click "New site from Git"
3. Connect your GitHub repository
4. Select the repository containing this project

### 2. Configure Build Settings

Netlify should automatically detect the build settings from `netlify.toml`:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18

### 3. Set Environment Variables

In your Netlify site settings:

1. Go to **Site settings** > **Environment variables**
2. Add the following environment variable:
   - **Key**: `VITE_API_URL`
   - **Value**: Your Railway backend URL (e.g., `https://medieval-commanders-production.up.railway.app`)

### 4. Deploy

1. Click "Deploy site"
2. Netlify will build and deploy your site
3. You'll get a URL like `https://your-site-name.netlify.app`

### 5. Update Railway CORS (if needed)

If you encounter CORS errors, you may need to add your Netlify domain to the Railway backend:

1. Go to your Railway project
2. Add environment variable:
   - **Key**: `FRONTEND_URL`
   - **Value**: Your Netlify URL (e.g., `https://your-site-name.netlify.app`)

## Environment Variables

### Frontend (Netlify)
- `VITE_API_URL`: Your Railway backend URL

### Backend (Railway)
- `FRONTEND_URL`: Your Netlify frontend URL (optional, for CORS)

## Troubleshooting

### CORS Issues
- Make sure your Railway backend has the correct CORS configuration
- Check that your Netlify URL is included in the allowed origins
- The backend now supports wildcard patterns for Netlify domains

### API Connection Issues
- Verify the `VITE_API_URL` environment variable is set correctly
- Check that your Railway backend is running and accessible
- Test the backend health endpoint: `https://your-railway-url.railway.app/api/health`

### Build Issues
- Ensure Node.js version 18 is used
- Check that all dependencies are installed correctly
- Review build logs in Netlify dashboard

## Development

For local development:
1. Start the backend: `npm run server`
2. Start the frontend: `npm run dev`
3. The frontend will automatically connect to `http://localhost:5001`
