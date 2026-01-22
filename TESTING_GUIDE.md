# Testing Guide - Verify Your Deployment

## ✅ Frontend Pages Working

Your frontend pages are loading successfully:
- ✅ `/register` - 200 OK
- ✅ `/login` - 200 OK

## Next: Test API Connection

### Test 1: Register a New User

1. Go to: `https://gallant-imagination-production-fe86.up.railway.app/register`
2. Fill in the registration form:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `test123456`
3. Click "Register"
4. **Expected Results:**
   - ✅ **Success**: Redirects to login or dashboard, shows success message
   - ❌ **Error**: Check browser console (F12) for errors

### Test 2: Check Browser Console

1. Open browser Developer Tools (F12)
2. Go to "Console" tab
3. Try to register/login
4. Look for:
   - ✅ **No errors**: API calls working
   - ❌ **CORS errors**: Backend CORS not configured correctly
   - ❌ **404 errors**: Backend URL incorrect
   - ❌ **Network errors**: Backend not accessible

### Test 3: Check Network Tab

1. Open Developer Tools (F12)
2. Go to "Network" tab
3. Try to register
4. Look for the API request:
   - **Request URL**: Should be `https://ticket-management-production-6a8a.up.railway.app/api/auth/register`
   - **Status**: Should be `200` or `400` (not `404`)
   - **Response**: Should show JSON response

### Test 4: Test Backend Directly

Open in browser:
```
https://ticket-management-production-6a8a.up.railway.app/api/auth/register
```

**Expected:**
- Should return JSON (even if validation error)
- Not 404

**If 404:**
- Backend is not running or routing is wrong
- Check backend logs in Railway

## Common Issues & Solutions

### Issue: CORS Error

**Error:** `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solution:**
1. Railway Dashboard → Backend Service → Variables
2. Check `FRONTEND_URL` = `https://gallant-imagination-production-fe86.up.railway.app`
3. Must match frontend URL exactly (with `https://`)
4. Redeploy backend after changing

### Issue: 404 on API Calls

**Error:** `404 Not Found` when calling API

**Solution:**
1. Check `NEXT_PUBLIC_API_URL` in frontend variables
2. Should be: `https://ticket-management-production-6a8a.up.railway.app/api`
3. Must include `https://` and `/api` at end
4. Redeploy frontend after changing

### Issue: Database Connection Error

**Error:** Backend logs show database connection errors

**Solution:**
1. Railway Dashboard → Backend Service → Variables
2. Verify `DATABASE_URL` is set (via database reference)
3. Check backend logs for connection errors
4. See `RAILWAY_DATABASE_SETUP.md` for details

## Verification Checklist

- [ ] Frontend pages load (✅ You have this!)
- [ ] Can access backend URL directly (test in browser)
- [ ] Browser console shows no CORS errors
- [ ] Network tab shows API calls going to correct URL
- [ ] Registration/login works end-to-end
- [ ] Backend logs show successful requests
- [ ] Database connection working (check backend logs)

## Next Steps After Testing

Once everything works:

1. **Test Full Flow:**
   - Register new user
   - Login
   - Create ticket
   - View tickets
   - Add comments

2. **Monitor Logs:**
   - Check Railway logs for any errors
   - Monitor performance

3. **Set Up Custom Domain (Optional):**
   - Railway → Settings → Custom Domain
   - Add your own domain name

## Success Indicators

✅ Frontend loads without errors  
✅ API calls return 200/400 (not 404)  
✅ No CORS errors in console  
✅ Database operations work  
✅ Users can register and login  
✅ Tickets can be created and viewed  

If all these work, your deployment is successful! 🎉
