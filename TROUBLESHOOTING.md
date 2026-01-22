# Troubleshooting Guide - Railway Deployment

## Common Issues and Solutions

### Issue 1: 404 Error When Calling Backend API

**Symptoms:**
- Frontend shows 404 when trying to register/login
- Error in browser console: `404 Not Found`
- Request path shows backend domain but returns 404

**Possible Causes:**

1. **Backend URL incorrect in Frontend Environment Variable**
2. **Backend service not running**
3. **Backend URL missing `/api` suffix**
4. **CORS configuration issue**

**Solution Steps:**

#### Step 1: Verify Backend is Running

1. Go to Railway Dashboard
2. Open your backend service
3. Check "Deployments" tab - should show "Active"
4. Check "Logs" tab - should show Spring Boot startup messages
5. Look for: `Started TicketingSystemApplication` in logs

#### Step 2: Get Correct Backend URL

1. In Railway Dashboard → Backend Service
2. Go to "Settings" tab
3. Scroll to "Networking" section
4. Click "Generate Domain" if not already generated
5. Copy the full URL (e.g., `https://ticket-management-production-6a8a.up.railway.app`)

#### Step 3: Verify Frontend Environment Variable

1. In Railway Dashboard → Frontend Service
2. Go to "Variables" tab
3. Check `NEXT_PUBLIC_API_URL` value
4. **It should be**: `https://ticket-management-production-6a8a.up.railway.app/api`
   - ✅ Include `https://`
   - ✅ Include full domain
   - ✅ Include `/api` at the end
   - ❌ Don't include `/api/auth` or other paths

#### Step 4: Test Backend Directly

Open in browser or use curl:
```bash
# Test if backend is accessible
curl https://ticket-management-production-6a8a.up.railway.app/api/auth/register

# Should return JSON (even if error, not 404)
```

If this returns 404, the backend is not running correctly.

#### Step 5: Check Backend Logs

1. Railway Dashboard → Backend Service → "Logs"
2. Look for errors:
   - Database connection errors
   - Port binding errors
   - Application startup failures

#### Step 6: Verify Backend Port Configuration

Check `application.properties`:
```properties
server.port=${PORT:8081}
```

Railway sets `PORT` automatically. Make sure backend is using the Railway-provided PORT.

#### Step 7: Rebuild Frontend After Environment Variable Change

After changing `NEXT_PUBLIC_API_URL`:
1. Railway will auto-redeploy
2. Or manually trigger redeploy: "Deployments" → "Redeploy"
3. Wait for build to complete
4. Clear browser cache and try again

---

### Issue 2: CORS Errors

**Symptoms:**
- Browser console shows: `CORS policy: No 'Access-Control-Allow-Origin'`
- Requests fail with CORS errors

**Solution:**

1. **Verify FRONTEND_URL in Backend:**
   - Railway Dashboard → Backend Service → Variables
   - `FRONTEND_URL` should be: `https://gallant-imagination-production-fe86.up.railway.app`
   - Must match your frontend Railway URL exactly
   - Include `https://` protocol

2. **Redeploy Backend** after changing FRONTEND_URL

---

### Issue 3: Database Connection Errors

**Symptoms:**
- Backend logs show: `Connection refused` or `Database not found`
- Application fails to start

**Solution:**

1. **Verify Database is Running:**
   - Railway Dashboard → PostgreSQL service
   - Should show "Active" status

2. **Check DATABASE_URL:**
   - Backend Service → Variables
   - `DATABASE_URL` should be set via "Add Reference"
   - Should look like: `postgresql://user:password@host:port/dbname`

3. **Verify DatabaseConfig.java:**
   - The DatabaseConfig class should handle Railway's DATABASE_URL format
   - Check backend logs for database connection errors

---

### Issue 4: Environment Variables Not Working

**Symptoms:**
- Frontend still uses localhost
- Backend uses default values

**Solution:**

1. **Frontend Environment Variables:**
   - Must start with `NEXT_PUBLIC_` to be accessible in browser
   - Example: `NEXT_PUBLIC_API_URL` (not `API_URL`)

2. **Rebuild Required:**
   - Next.js environment variables are baked into build
   - Must rebuild after changing environment variables
   - Railway should auto-rebuild, but you can manually trigger

3. **Backend Environment Variables:**
   - Available at runtime
   - No rebuild needed, but restart required

---

### Issue 5: Build Failures

**Backend Build Fails:**

1. Check Railway logs for Maven errors
2. Verify `pom.xml` is correct
3. Ensure Java 17 is available (Railway auto-detects)
4. Check build command: `mvn clean package -DskipTests`

**Frontend Build Fails:**

1. Check Railway logs for npm errors
2. Verify `package.json` is correct
3. Check build command: `npm install && npm run build`
4. Ensure Node.js version is compatible

---

## Quick Debug Checklist

- [ ] Backend service is "Active" in Railway
- [ ] Backend logs show "Started TicketingSystemApplication"
- [ ] Backend URL is accessible (test in browser)
- [ ] `NEXT_PUBLIC_API_URL` = `https://backend-url.up.railway.app/api`
- [ ] `FRONTEND_URL` = `https://frontend-url.up.railway.app`
- [ ] Database is running and connected
- [ ] Both services have been rebuilt after env var changes
- [ ] Browser cache cleared

---

## Testing Backend Endpoints

Test these endpoints directly in browser or Postman:

```bash
# Health check (if you have one)
curl https://your-backend.up.railway.app/api/auth/register

# Register endpoint (should return validation error, not 404)
curl -X POST https://your-backend.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test123"}'
```

If these return 404, the backend routing is not working correctly.

---

## Still Having Issues?

1. **Check Railway Status**: https://status.railway.app
2. **Railway Discord**: https://discord.gg/railway
3. **Railway Docs**: https://docs.railway.app
