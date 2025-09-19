# Safe Database Migration Guide

## Overview
This guide shows you how to safely update your PostgreSQL database on Railway without losing any existing data. The migration will only add new optional columns to the `admins` table.

## What Will Be Added
- `instagramUrl` (optional string)
- `twitterUrl` (optional string) 
- `facebookUrl` (optional string)
- `linkedinUrl` (optional string)
- `youtubeUrl` (optional string)

## Why This Is Safe
- ✅ **No data deletion** - Only adding new columns
- ✅ **Optional fields** - All new columns are nullable
- ✅ **No existing data modification** - Current data remains untouched
- ✅ **Backward compatible** - Existing code will continue to work
- ✅ **Reversible** - Can be rolled back if needed

## Migration Methods

### Method 1: Automated Script (Recommended)
```bash
./migrate-production-safe.sh
```

### Method 2: Manual Steps

#### Step 1: Set Environment Variables
Make sure your `DATABASE_URL` is set to your Railway PostgreSQL connection string:
```bash
export DATABASE_URL="postgresql://username:password@host:port/database"
```

#### Step 2: Create Migration
```bash
npx prisma migrate dev --name add_admin_social_media_fields --create-only
```

#### Step 3: Review Migration
Check the generated migration file in `prisma/migrations/` to ensure it only adds columns:
```sql
-- This is what the migration should look like:
ALTER TABLE "admins" ADD COLUMN "instagramUrl" TEXT;
ALTER TABLE "admins" ADD COLUMN "twitterUrl" TEXT;
ALTER TABLE "admins" ADD COLUMN "facebookUrl" TEXT;
ALTER TABLE "admins" ADD COLUMN "linkedinUrl" TEXT;
ALTER TABLE "admins" ADD COLUMN "youtubeUrl" TEXT;
```

#### Step 4: Apply Migration
```bash
npx prisma migrate deploy
```

#### Step 5: Regenerate Client
```bash
npx prisma generate
```

## Verification Steps

### 1. Check Database Schema
Connect to your Railway database and verify the new columns:
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'admins' 
ORDER BY ordinal_position;
```

### 2. Test Application
1. Deploy your updated backend code
2. Test the admin settings endpoint: `GET /api/admin/settings`
3. Verify it returns the new social media fields (empty initially)
4. Test updating social media URLs via admin panel

## Rollback Plan (If Needed)

If you need to rollback the migration:

### Option 1: Prisma Rollback
```bash
# This will revert to the previous migration
npx prisma migrate resolve --rolled-back add_admin_social_media_fields
```

### Option 2: Manual SQL Rollback
```sql
-- Connect to your database and run:
ALTER TABLE "admins" DROP COLUMN IF EXISTS "instagramUrl";
ALTER TABLE "admins" DROP COLUMN IF EXISTS "twitterUrl";
ALTER TABLE "admins" DROP COLUMN IF EXISTS "facebookUrl";
ALTER TABLE "admins" DROP COLUMN IF EXISTS "linkedinUrl";
ALTER TABLE "admins" DROP COLUMN IF EXISTS "youtubeUrl";
```

## Troubleshooting

### Common Issues:

1. **Connection Error**
   - Verify your `DATABASE_URL` is correct
   - Check Railway service is running
   - Ensure database is accessible

2. **Permission Error**
   - Make sure your database user has ALTER TABLE permissions
   - Check Railway database credentials

3. **Migration Already Exists**
   - If migration already exists, use: `npx prisma migrate deploy`
   - Or reset migrations: `npx prisma migrate reset` (⚠️ This will delete data!)

### Getting Help:
- Check Railway logs for database errors
- Verify Prisma connection with: `npx prisma db pull`
- Test connection with: `npx prisma db execute --stdin` (then type `SELECT 1;`)

## Safety Checklist

Before running migration:
- [ ] Database backup (Railway provides automatic backups)
- [ ] Test migration on a copy of production data
- [ ] Verify `DATABASE_URL` is correct
- [ ] Ensure no other migrations are running
- [ ] Have rollback plan ready

After migration:
- [ ] Verify new columns exist
- [ ] Test application functionality
- [ ] Check admin settings work
- [ ] Verify no data was lost
- [ ] Test social media URL functionality

## Expected Results

After successful migration:
- ✅ 5 new optional columns in `admins` table
- ✅ Existing admin records unchanged
- ✅ Application continues to work normally
- ✅ New social media settings available in admin panel
- ✅ Footer component can display social media links

---

**Remember: This migration is designed to be safe and non-destructive. Your existing data will remain completely intact.**
