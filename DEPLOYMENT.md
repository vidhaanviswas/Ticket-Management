# Render Deployment Guide

This guide will help you deploy the Ticketing System to Render platform.

> ⚠️ **Note**: Render doesn't support Java/Spring Boot natively in Blueprint (render.yaml).  
> **For easier Java deployment, consider using Railway.app instead** - see `RAILWAY_DEPLOYMENT.md`  
> **For other alternatives, see** `ALTERNATIVES.md`

## Prerequisites

1. A GitHub account with this repository
2. A Render account (sign up at https://render.com)

## Deployment Steps

### 1. Create PostgreSQL Database

1. Log in to Render Dashboard
2. Click "New +" → "PostgreSQL"
3. Configure:
   - **Name**: `ticketing-db`
   - **Database**: `ticketing_system`
   - **User**: `ticketing_user`
   - **Region**: Choose closest to your users
   - **PostgreSQL Version**: Latest stable
4. Click "Create Database"
5. **Note the connection string** - you'll need it for the backend

### 2. Deploy Backend (Spring Boot)

1. In Render Dashboard, click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `ticketing-backend` (or your preferred name)
   - **Environment**: `Java` ⚠️ **IMPORTANT: Select "Java", NOT "Node" or "Auto-detect"**
   - **Region**: Same as database
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `ticketing-system-backend` ⚠️ **Must be set correctly**
   - **Build Command**: `mvn clean package -DskipTests`
   - **Start Command**: `java -jar target/ticketing-system-1.0.0.jar`
   
   **⚠️ Common Mistake**: If you see "mvn: command not found" error, it means the Environment is set to "Node" instead of "Java". Go to Settings and change it to "Java".
4. Add Environment Variables:
   - `DATABASE_URL` - Use the connection string from your PostgreSQL database
   - `JWT_SECRET` - Generate a strong random string (e.g., use an online generator or `openssl rand -base64 32`)
   - `FRONTEND_URL` - Will set this after frontend is deployed (format: `https://your-frontend-name.onrender.com`)
   - `STORAGE_PATH` - `/opt/render/project/src/uploads` (optional, for file storage)
   - `PORT` - Auto-set by Render (don't manually set)
5. Click "Create Web Service"
6. Wait for the build to complete (5-10 minutes for first build)
7. **Note the backend URL** - you'll need it for the frontend

### 3. Deploy Frontend (Next.js)

1. In Render Dashboard, click "New +" → "Web Service"
2. Connect your GitHub repository (same as backend)
3. Configure the service:
   - **Name**: `ticketing-frontend` (or your preferred name)
   - **Environment**: `Node`
   - **Region**: Same as backend
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `ticketing-system-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL` - Your backend URL + `/api` (e.g., `https://ticketing-backend.onrender.com/api`)
5. Click "Create Web Service"
6. Wait for the build to complete

### 4. Update Backend CORS Configuration

1. Go back to your backend service in Render
2. Go to "Environment" tab
3. Update `FRONTEND_URL` to your frontend URL (e.g., `https://ticketing-frontend.onrender.com`)
4. Click "Save Changes"
5. The service will automatically redeploy

### 5. Verify Deployment

1. Visit your frontend URL
2. Try registering a new user
3. Test login functionality
4. Create a test ticket

## Important Notes

### File Storage

⚠️ **Important**: The current file storage uses the local filesystem (`uploads/` folder), which is **ephemeral** on Render. This means:
- Files will be lost when the service restarts
- Files won't persist across deployments

**Solutions**:
1. **Render Disk** (Paid): Add persistent disk storage
2. **Cloud Storage** (Recommended): Migrate to AWS S3, Cloudinary, or similar service

### Database Connection

The application automatically handles both JDBC format and PostgreSQL URI format for `DATABASE_URL`. The `DatabaseConfig` class will parse the connection string correctly.

### Environment Variables Summary

**Backend**:
- `DATABASE_URL` - PostgreSQL connection string (from Render database)
- `JWT_SECRET` - Secret key for JWT tokens (generate a strong random string)
- `FRONTEND_URL` - Frontend URL for CORS (e.g., `https://your-frontend.onrender.com`)
- `STORAGE_PATH` - Optional, for file storage path
- `PORT` - Auto-set by Render

**Frontend**:
- `NEXT_PUBLIC_API_URL` - Backend API URL (e.g., `https://your-backend.onrender.com/api`)

### Troubleshooting

1. **Build Fails**:
   - Check build logs in Render dashboard
   - Ensure Maven/Node versions are compatible
   - Verify all dependencies are in `pom.xml`/`package.json`

2. **Database Connection Errors**:
   - Verify `DATABASE_URL` is set correctly
   - Check database is running and accessible
   - Ensure database name, user, and password are correct

3. **CORS Errors**:
   - Verify `FRONTEND_URL` in backend matches your frontend URL exactly
   - Check browser console for specific CORS error messages

4. **API Not Found**:
   - Verify `NEXT_PUBLIC_API_URL` includes `/api` at the end
   - Check backend is running and accessible
   - Test backend URL directly in browser

### Using render.yaml (Optional)

If you prefer using Render Blueprint (render.yaml), you can:
1. Push the `render.yaml` file to your repository
2. In Render Dashboard, click "New +" → "Blueprint"
3. Connect your repository
4. Render will automatically create all services and database

**Note**: You'll still need to manually set `FRONTEND_URL` and `NEXT_PUBLIC_API_URL` after both services are deployed.

## Support

For issues specific to:
- **Render Platform**: Check Render documentation or support
- **Application Code**: Check the application logs in Render dashboard
- **Database Issues**: Verify database is running and connection string is correct
