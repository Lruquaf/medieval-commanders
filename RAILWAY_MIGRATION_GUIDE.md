# Railway Production Migration Guide

## The Issue
Your local environment is configured for SQLite development, but we need to migrate your Railway PostgreSQL database. The migration script tried to connect to `localhost:51214` instead of your Railway database.

## Quick Solutions

### Option 1: Direct DATABASE_URL Migration (Easiest)

1. **Get your Railway DATABASE_URL:**
   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Click on your project
   - Click on your PostgreSQL service
   - Go to "Connect" tab
   - Copy the "Connection String"

2. **Run migration with Railway DATABASE_URL:**
   ```bash
   # Replace with your actual Railway connection string
   DATABASE_URL="postgresql://username:password@host:port/database" npx prisma migrate deploy
   ```

3. **Regenerate Prisma client:**
   ```bash
   DATABASE_URL="postgresql://username:password@host:port/database" npx prisma generate
   ```

### Option 2: Use Railway CLI

1. **Install Railway CLI (if not installed):**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and link project:**
   ```bash
   railway login
   railway link
   ```

3. **Run migration:**
   ```bash
   railway run npx prisma migrate deploy
   railway run npx prisma generate
   ```

### Option 3: Railway Dashboard Shell

1. Go to your Railway project dashboard
2. Click on your backend service
3. Go to "Deployments" tab
4. Click on the latest deployment
5. Click "Open Shell" or "Connect"
6. Run in the shell:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

## What the Migration Will Do

The migration will add these columns to your `admins` table:
```sql
ALTER TABLE "admins" ADD COLUMN "instagramUrl" TEXT;
ALTER TABLE "admins" ADD COLUMN "twitterUrl" TEXT;
ALTER TABLE "admins" ADD COLUMN "facebookUrl" TEXT;
ALTER TABLE "admins" ADD COLUMN "linkedinUrl" TEXT;
ALTER TABLE "admins" ADD COLUMN "youtubeUrl" TEXT;
```

## Safety Notes

- ✅ **100% Safe** - Only adds new optional columns
- ✅ **No data loss** - Existing data remains untouched
- ✅ **Backward compatible** - Current app continues working
- ✅ **Reversible** - Can be rolled back if needed

## Verification

After migration, test your admin settings:
1. Deploy your updated backend code
2. Test: `GET /api/admin/settings`
3. Should return social media fields (empty initially)
4. Test updating social media URLs in admin panel

## Troubleshooting

### "Can't reach database server"
- Make sure you're using the Railway DATABASE_URL, not local
- Check that your Railway service is running
- Verify the connection string is correct

### "Migration already exists"
- Run: `DATABASE_URL="your-url" npx prisma migrate deploy`
- This will apply any pending migrations

### "Permission denied"
- Make sure your database user has ALTER TABLE permissions
- Railway usually provides full permissions by default

## Next Steps After Migration

1. Deploy your updated backend code to Railway
2. Deploy your updated frontend to Netlify
3. Test the new admin settings functionality
4. Configure social media URLs in the admin panel
5. Verify the footer displays social media links

---

**The migration is safe and will not affect your existing data!**
