# Railway Database Setup Guide

## How to Connect Backend to Database in Railway

### Step 1: Verify Database is Running

1. Go to Railway Dashboard
2. Find your database service: `ticketing-db`
3. Check it shows "Active" status
4. Note the **Private Networking** address: `ticketing-db.railway.internal`

### Step 2: Add Database Reference to Backend Service

**This is the CRITICAL step that connects your backend to the database:**

1. Go to your **Backend Service** (not the database)
2. Click on **"Variables"** tab
3. Click **"+ New Variable"** or **"Add Reference"**
4. Select **"Add Reference"** (this is important!)
5. In the dropdown, select your database: **`ticketing-db`**
6. Select the variable: **`DATABASE_URL`**
7. Click **"Add"**

**What this does:**
- Railway automatically creates a `DATABASE_URL` environment variable
- Format: `postgresql://user:password@host:port/dbname`
- This is the connection string your backend needs

### Step 3: Verify DATABASE_URL is Set

1. In Backend Service → Variables tab
2. You should see: `DATABASE_URL` = `postgresql://...` (long connection string)
3. If you don't see it, repeat Step 2

### Step 4: How DatabaseConfig.java Works

Your `DatabaseConfig.java` automatically:
1. Reads `DATABASE_URL` from environment
2. Parses the PostgreSQL URI format: `postgresql://user:pass@host:port/db`
3. Converts it to JDBC format: `jdbc:postgresql://host:port/db`
4. Creates the DataSource with correct credentials

**No manual configuration needed!** Just add the reference.

### Step 5: Test Database Connection

1. Redeploy your backend service
2. Check backend logs for:
   - ✅ `HikariPool-1 - Starting...` (connection pool starting)
   - ✅ `HikariPool-1 - Start completed` (connected successfully)
   - ❌ `Connection refused` or `Database not found` (connection failed)

### Common Issues

#### Issue 1: DATABASE_URL Not Set

**Symptom:** Backend logs show connection errors

**Solution:**
- Make sure you used **"Add Reference"** not "New Variable"
- Verify the reference is to the correct database service
- Check Variables tab shows `DATABASE_URL`

#### Issue 2: Wrong Database URL Format

**Symptom:** `Invalid DATABASE_URL format` error

**Solution:**
- Railway's DATABASE_URL should be in format: `postgresql://user:password@host:port/dbname`
- DatabaseConfig.java handles this automatically
- If error persists, check backend logs for the actual DATABASE_URL value

#### Issue 3: Database Not Accessible

**Symptom:** `Connection refused` or timeout

**Solution:**
- Verify database service is "Active"
- Check database logs for errors
- Ensure you're using Railway's internal network (automatic with reference)

### Step 6: Manual Database URL (If Reference Doesn't Work)

If "Add Reference" doesn't work, you can manually set DATABASE_URL:

1. Go to Database Service → Variables tab
2. Find these variables:
   - `PGHOST` (host)
   - `PGPORT` (port, usually 5432)
   - `PGUSER` (username)
   - `PGPASSWORD` (password)
   - `PGDATABASE` (database name)
3. Construct DATABASE_URL:
   ```
   postgresql://PGUSER:PGPASSWORD@PGHOST:PGPORT/PGDATABASE
   ```
4. Add this as a manual variable in Backend Service

**But "Add Reference" is much easier and recommended!**

### Verification Checklist

- [ ] Database service is "Active"
- [ ] Backend service has `DATABASE_URL` variable (via reference)
- [ ] DATABASE_URL starts with `postgresql://`
- [ ] Backend logs show successful database connection
- [ ] No connection errors in backend logs

### Example DATABASE_URL Format

Railway provides DATABASE_URL in this format:
```
postgresql://postgres:password123@switchyard.proxy.rlwy.net:21370/railway
```

Your DatabaseConfig.java automatically converts this to:
```
jdbc:postgresql://switchyard.proxy.rlwy.net:21370/railway
```

And extracts:
- Username: `postgres`
- Password: `password123`
- Host: `switchyard.proxy.rlwy.net`
- Port: `21370`
- Database: `railway`

**All handled automatically!** Just add the reference.
