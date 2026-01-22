# Fly.io Deployment Guide

Fly.io is another excellent free alternative for deploying Java/Spring Boot applications. It uses Docker and has a generous free tier.

## Why Fly.io?

✅ **Free Tier** - 3 shared-cpu-1x VMs (generous)  
✅ **Global Edge Network** - Fast worldwide  
✅ **PostgreSQL Support** - Managed databases  
✅ **Docker-based** - Works with any language  
✅ **Free SSL** - Automatic HTTPS  

## Prerequisites

1. GitHub account with your repository
2. Fly.io account (sign up at https://fly.io - free)
3. Fly CLI installed (optional, but recommended)

## Deployment Steps

### 1. Install Fly CLI

```bash
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Mac/Linux
curl -L https://fly.io/install.sh | sh
```

### 2. Sign Up / Login

```bash
fly auth signup
# or
fly auth login
```

### 3. Create Dockerfile for Backend

Create `ticketing-system-backend/Dockerfile`:

```dockerfile
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/ticketing-system-1.0.0.jar app.jar
EXPOSE 8080
ENV PORT=8080
CMD ["java", "-jar", "app.jar"]
```

### 4. Deploy Backend

```bash
cd ticketing-system-backend
fly launch
```

Follow the prompts:
- App name: `ticketing-backend` (or your choice)
- Region: Choose closest to you
- PostgreSQL: Yes (creates database)
- Redis: No

### 5. Set Environment Variables

```bash
fly secrets set DATABASE_URL=$(fly postgres connect -a ticketing-backend-db)
fly secrets set JWT_SECRET="your-generated-secret-key"
fly secrets set FRONTEND_URL="https://your-frontend.fly.dev"
```

### 6. Deploy Frontend

Create `ticketing-system-frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["npm", "start"]
```

Deploy:
```bash
cd ticketing-system-frontend
fly launch
```

Set environment variable:
```bash
fly secrets set NEXT_PUBLIC_API_URL="https://ticketing-backend.fly.dev/api"
```

## Free Tier Limits

- **3 shared-cpu-1x VMs** (256MB RAM each)
- **3GB persistent volume storage**
- **160GB outbound data transfer/month**
- Usually enough for small to medium apps

## Advantages

✅ Very generous free tier  
✅ Global edge network (fast worldwide)  
✅ Docker-based (works with anything)  
✅ Good documentation  

## Disadvantages

⚠️ Requires Docker knowledge  
⚠️ More setup steps than Railway  
⚠️ CLI-based (less GUI-friendly)  

## Recommendation

**Use Railway instead** if you want easier setup. Use Fly.io if you need:
- More free resources
- Global edge network
- Docker-based deployment

For more help: https://fly.io/docs
