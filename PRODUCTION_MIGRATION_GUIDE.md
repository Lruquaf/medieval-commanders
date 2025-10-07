# Production Migration Guide

## Overview
This guide covers the migration of local development changes to production. The changes include new database fields, enhanced admin functionality, and a new footer component with social media integration.

## Changes Summary

### 1. Database Schema Updates
- **New Fields Added to Admin Model:**
  - `instagramUrl` (String, optional)
  - `twitterUrl` (String, optional) 
  - `facebookUrl` (String, optional)
  - `linkedinUrl` (String, optional)
  - `youtubeUrl` (String, optional)

- **Existing Fields (Already Present):**
  - `birthYear` and `deathYear` fields in Card and Proposal models

### 2. New Features
- **Footer Component:** Dynamic social media links based on admin settings
- **Enhanced Admin Panel:** Social media settings management
- **Improved Sorting:** Better filtering and sorting capabilities
- **Enhanced UI:** Responsive design improvements

### 3. API Updates
- **New Endpoints:**
  - `GET /api/proposals` - Public proposals endpoint
- **Enhanced Endpoints:**
  - `GET /api/admin/settings` - Now returns social media URLs
  - `PUT /api/admin/settings` - Now accepts social media URLs

## Migration Steps

### Step 1: Database Migration

1. **Update Prisma Schema:**
   ```bash
   # The schema files have been updated with new Admin fields
   # No additional changes needed
   ```

2. **Generate and Apply Migration:**
   ```bash
   # In your production environment
   npx prisma migrate dev --name add_admin_social_media_fields
   # or for production
   npx prisma migrate deploy
   ```

3. **Regenerate Prisma Client:**
   ```bash
   npx prisma generate
   ```

### Step 2: Deploy Backend Changes

1. **Update Server Code:**
   - The production server code has been updated with new admin settings functionality
   - New social media URL handling in admin settings endpoints

2. **Deploy to Railway:**
   ```bash
   # Commit and push changes
   git add .
   git commit -m "Add social media settings and enhanced admin functionality"
   git push origin main
   ```

3. **Verify Deployment:**
   - Check Railway logs for successful deployment
   - Test health endpoint: `https://your-backend.railway.app/api/health`
   - Test admin settings endpoint: `https://your-backend.railway.app/api/admin/settings`

### Step 3: Deploy Frontend Changes

1. **Frontend is Already Updated:**
   - All frontend changes are already in place
   - Footer component is included
   - Admin panel enhancements are active

2. **Deploy to Netlify:**
   ```bash
   # Build and deploy
   npm run build
   # Deploy to Netlify (if using CLI)
   netlify deploy --prod
   ```

3. **Verify Frontend:**
   - Check that footer appears on all pages except admin
   - Test admin panel social media settings
   - Verify responsive design works correctly

### Step 4: Environment Variables

**No new environment variables required** - all new features use existing database fields.

### Step 5: Testing

1. **Test Admin Settings:**
   - Login to admin panel
   - Go to Settings tab
   - Add social media URLs
   - Verify they appear in footer

2. **Test Footer:**
   - Visit main collection page
   - Verify footer appears with social media links
   - Test that links open in new tabs

3. **Test Responsive Design:**
   - Test on mobile devices
   - Verify admin panel works on tablets
   - Check footer layout on different screen sizes

## Rollback Plan

If issues occur:

1. **Database Rollback:**
   ```bash
   # Revert to previous migration
   npx prisma migrate reset
   # or
   npx prisma migrate resolve --rolled-back <migration_name>
   ```

2. **Code Rollback:**
   ```bash
   # Revert to previous commit
   git revert <commit_hash>
   git push origin main
   ```

## Post-Migration Checklist

- [ ] Database migration completed successfully
- [ ] Backend deployed and healthy
- [ ] Frontend deployed and accessible
- [ ] Admin settings functionality working
- [ ] Footer displaying correctly
- [ ] Social media links working
- [ ] Responsive design verified
- [ ] No console errors in browser
- [ ] All existing functionality still working

## Notes

- **Backward Compatibility:** All changes are backward compatible
- **No Data Loss:** Existing data remains intact
- **Performance:** No significant performance impact
- **Security:** No new security considerations

## Support

If you encounter any issues during migration:
1. Check Railway logs for backend errors
2. Check Netlify logs for frontend errors
3. Verify environment variables are set correctly
4. Test database connectivity
5. Check API endpoints are responding

## Files Modified

### Backend:
- `prisma/schema.prisma` - Canonical schema (Admin social media fields included)
- `server/index.js` - Enhanced admin settings endpoints

### Frontend:
- `src/components/Footer.jsx` - New footer component
- `src/App.jsx` - Added footer to non-admin pages
- `src/pages/AdminPanel.jsx` - Enhanced with social media settings
- `src/pages/CollectionGallery.jsx` - Improved sorting and filtering
- `src/index.css` - Enhanced styling and responsive design

All changes are ready for production deployment!
