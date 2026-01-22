# Railway Deployment Guide

Railway is the **easiest and best free alternative** for deploying Java/Spring Boot applications. It supports Java natively and has a generous free tier.

## Why Railway?

✅ **Native Java Support** - No Docker needed  
✅ **Free Tier** - $5 credit/month (usually enough for small apps)  
✅ **Easy Setup** - Connect GitHub and deploy  
✅ **PostgreSQL Included** - Built-in database support  
✅ **Auto-deploy** - Deploys on every push  
✅ **Environment Variables** - Easy configuration  

## Prerequisites

1. GitHub account with your repository
2. Railway account (sign up at https://railway.app - free)

## Deployment Steps

### 1. Create Railway Account

1. Go to https://railway.app
2. Sign up with GitHub
3. You'll get $5 free credit monthly

### 2. Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Connect your repository: `vidhaanviswas/Ticket-Management`
4. Railway will auto-detect your project

### 3. Add PostgreSQL Database

1. In your Railway project, click "+ New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will create a PostgreSQL database
4. **Note the connection details** (you'll need them)

### 4. Deploy Backend Service

1. In Railway project, click "+ New" → "GitHub Repo"
2. Select your repository again
3. Railway will detect it's a Java project
4. Configure the service:
   - **Root Directory**: `ticketing-system-backend`
   - **Build Command**: `mvn clean package -DskipTests` (auto-detected)
   - **Start Command**: `java -jar target/ticketing-system-1.0.0.jar` (auto-detected)
5. Add Environment Variables:
   - `DATABASE_URL` - Click "Add Reference" → Select your PostgreSQL database → Select `DATABASE_URL`
   - `JWT_SECRET` - Generate a strong random string (use: `openssl rand -base64 32` or online generator)
   - `FRONTEND_URL` - Set this after frontend is deployed (format: `https://your-frontend.up.railway.app`)
   - `PORT` - Railway sets this automatically (don't manually set)
   - `STORAGE_PATH` - `/app/uploads` (optional, for file storage)
6. Click "Deploy"
7. Wait for build to complete (5-10 minutes first time)
8. **Note the backend URL** - Click on the service → "Settings" → "Generate Domain"

### 5. Deploy Frontend Service

1. In Railway project, click "+ New" → "GitHub Repo"
2. Select your repository
3. Configure:
   - **Root Directory**: `ticketing-system-frontend`
   - **Build Command**: `npm install && npm run build` (auto-detected)
   - **Start Command**: `npm start` (auto-detected)
   - **Note**: Make sure `next.config.js` does NOT have `output: 'standalone'` for Railway
4. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL` - Your backend URL + `/api` (e.g., `https://ticketing-backend.up.railway.app/api`)
5. Click "Deploy"
6. Generate domain for frontend (Settings → Generate Domain)

### 6. Update Backend CORS

1. Go to backend service → "Variables" tab
2. Update `FRONTEND_URL` to your frontend Railway URL (e.g., `https://ticketing-frontend.up.railway.app`)
3. Railway will auto-redeploy

## Environment Variables Summary

**Backend:**
- `DATABASE_URL` - Auto-set from PostgreSQL database (via reference)
- `JWT_SECRET` - Your generated secret key
- `FRONTEND_URL` - Frontend Railway URL
- `PORT` - Auto-set by Railway
- `STORAGE_PATH` - `/app/uploads` (optional)

**Frontend:**
- `NEXT_PUBLIC_API_URL` - Backend URL + `/api`

## Railway Features

- **Auto-deploy**: Deploys automatically on every git push
- **Logs**: View real-time logs in Railway dashboard
- **Metrics**: Monitor CPU, memory, and network usage
- **Custom Domains**: Add your own domain name
- **Team Collaboration**: Share projects with team members

## Pricing

- **Free Tier**: $5 credit/month (usually enough for 1-2 small services)
- **Hobby Plan**: $5/month (if you exceed free tier)
- **Pro Plan**: $20/month (for production apps)

## Troubleshooting

1. **Build Fails**:
   - Check logs in Railway dashboard
   - Ensure Maven is available (Railway auto-detects)
   - Verify `pom.xml` is correct

2. **Database Connection Issues**:
   - Verify `DATABASE_URL` is set correctly
   - Check database is running
   - Use Railway's "Add Reference" feature for automatic connection

3. **CORS Errors**:
   - Verify `FRONTEND_URL` matches your frontend Railway URL exactly
   - Check browser console for specific errors

4. **Service Not Starting**:
   - Check logs for Java errors
   - Verify JAR file is being created in build
   - Ensure `startCommand` is correct

## Advantages Over Render

✅ Native Java support (no manual configuration needed)  
✅ Better auto-detection  
✅ Easier environment variable management  
✅ Better free tier  
✅ Simpler deployment process  

## Next Steps

1. Push your code to GitHub
2. Follow the steps above to deploy on Railway
3. Your app will be live at `https://your-app.up.railway.app`

For more help, visit Railway docs: https://docs.railway.app
