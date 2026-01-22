# 🎫 Ticket Management System

A full-stack ticketing system built with Spring Boot and Next.js, designed for efficient ticket tracking, assignment, and resolution management.

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-14.0.4-black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## 🌐 Live Deployment

### 🔗 Application Links

- **Frontend (Live)**: [https://ticket-management-app.up.railway.app/](https://ticket-management-app.up.railway.app/)

### 🔑 Demo Login Credentials

You can use these credentials to explore the application:

#### 👤 Regular User
- **Username**: `user1`
- **Password**: `user1`
- **Role**: USER
- **Access**: Create and manage own tickets

#### 🛠️ Support Agent
- **Username**: `sa1`
- **Password**: `sa1`
- **Role**: SUPPORT_AGENT
- **Access**: View all tickets, assign tickets, update statuses

#### 👨‍💼 Admin
- **Username**: `Contact Me!`
- **Password**: `Contact Me!`
- **Role**: ADMIN
- **Access**: Full system access including user management

> ⚠️ **Note**: These are demo accounts. Please do not modify or delete existing data. Feel free to create your own account using the registration page!

### 🚀 Quick Start

1. Visit the [Live Application](https://ticket-management-app.up.railway.app/)
2. Click on **"Login"** or use one of the demo credentials above
3. Explore the dashboard, create tickets, and test all features!

---

## 📋 Table of Contents

- [Live Deployment](#-live-deployment)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Local Development Setup](#-local-development-setup)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Environment Variables](#-environment-variables)
- [User Roles](#-user-roles)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### Core Functionality
- 🔐 **User Authentication** - Secure JWT-based authentication system
- 🎫 **Ticket Management** - Create, view, update, and track tickets
- 👥 **User Roles** - Three-tier role system (User, Support Agent, Admin)
- 💬 **Comments** - Add comments and discussions on tickets
- 📎 **File Attachments** - Upload and download attachments (PDF, images)
- ⭐ **Ticket Ratings** - Rate and provide feedback on resolved tickets
- 🔍 **Search & Filter** - Advanced search and filtering capabilities
- 📊 **Dashboard** - Overview of tickets and statistics

### User Experience
- 🎨 **Modern UI** - Beautiful, responsive design with dark mode support
- ⚡ **Real-time Updates** - Instant feedback and notifications
- 📱 **Mobile Responsive** - Works seamlessly on all devices
- 🚨 **Error Handling** - Comprehensive error pages (404, error boundary)
- 🔔 **Toast Notifications** - User-friendly notification system

### Security
- 🔒 **JWT Authentication** - Secure token-based authentication
- 🛡️ **Role-Based Access Control** - Fine-grained permissions
- 🔐 **Password Encryption** - BCrypt password hashing
- 🌐 **CORS Configuration** - Secure cross-origin requests

## 🛠️ Tech Stack

### Backend
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17
- **Build Tool**: Maven
- **Database**: PostgreSQL 12+
- **Security**: Spring Security + JWT
- **ORM**: Spring Data JPA / Hibernate

### Frontend
- **Framework**: Next.js 14.0.4
- **Language**: TypeScript 5.0
- **UI Library**: React 18.2.0
- **HTTP Client**: Axios
- **Styling**: CSS Modules
- **State Management**: React Context API

### Infrastructure
- **Deployment**: Railway.app (recommended) or Render
- **Database**: PostgreSQL (managed)
- **File Storage**: Local filesystem (can be migrated to cloud storage)

## 📁 Project Structure

```
Ticket Management/
├── ticketing-system-backend/          # Spring Boot Backend
│   ├── src/
│   │   └── main/
│   │       ├── java/com/ticketing/
│   │       │   ├── config/           # Configuration classes
│   │       │   ├── controller/       # REST Controllers
│   │       │   ├── dto/              # Data Transfer Objects
│   │       │   ├── model/            # Entity models
│   │       │   ├── repository/       # Data repositories
│   │       │   ├── security/         # Security configuration
│   │       │   └── service/          # Business logic
│   │       └── resources/
│   │           └── application.properties
│   └── pom.xml
│
├── ticketing-system-frontend/         # Next.js Frontend
│   ├── src/
│   │   ├── app/                      # Next.js App Router pages
│   │   │   ├── admin/                # Admin dashboard
│   │   │   ├── dashboard/            # User dashboard
│   │   │   ├── login/                # Login page
│   │   │   ├── register/             # Registration page
│   │   │   ├── tickets/             # Ticket pages
│   │   │   ├── error.tsx             # Error boundary
│   │   │   └── not-found.tsx         # 404 page
│   │   ├── components/               # React components
│   │   ├── context/                  # React Context
│   │   ├── lib/                      # Utilities & API client
│   │   └── types/                    # TypeScript types
│   └── package.json
│
└── Documentation/
    ├── README.md                     # This file
    ├── RAILWAY_DEPLOYMENT.md         # Railway deployment guide
    ├── DEPLOYMENT.md                 # Render deployment guide
    ├── TROUBLESHOOTING.md            # Common issues & solutions
    └── TESTING_GUIDE.md              # Testing instructions
```

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Java Development Kit (JDK)** 17 or higher
- **Maven** 3.6+ (for backend)
- **Node.js** 18+ and **npm** (for frontend)
- **PostgreSQL** 12+ (for local development)
- **Git** (for version control)

### Verify Installation

```bash
java -version    # Should show Java 17+
mvn -version     # Should show Maven 3.6+
node -v          # Should show Node 18+
npm -v           # Should show npm 8+
psql --version   # Should show PostgreSQL 12+
```

## 🚀 Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/vidhaanviswas/Ticket-Management.git
cd Ticket-Management
```

### 2. Database Setup

#### Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE ticketing_system;

# Exit psql
\q
```

### 3. Backend Setup

```bash
cd ticketing-system-backend
```

#### Configure Database

Edit `src/main/resources/application.properties`:

```properties
# Update these with your PostgreSQL credentials
spring.datasource.url=jdbc:postgresql://localhost:5432/ticketing_system
spring.datasource.username=postgres
spring.datasource.password=your_password
```

#### Build and Run

```bash
# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

The backend will start at `http://localhost:8081`

### 4. Frontend Setup

Open a new terminal:

```bash
cd ticketing-system-frontend
```

#### Install Dependencies

```bash
npm install
```

#### Configure API URL

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8081/api
```

#### Run Development Server

```bash
npm run dev
```

The frontend will start at `http://localhost:3000`

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8081/api
- **API Documentation**: Check API endpoints section below

## 🌐 Deployment

### Railway (Recommended)

Railway provides native Java support and is the easiest deployment option.

📖 **See**: [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for detailed instructions.

**Quick Steps:**
1. Sign up at [railway.app](https://railway.app)
2. Create new project from GitHub
3. Add PostgreSQL database
4. Deploy backend and frontend services
5. Configure environment variables


## 📚 API Documentation

### Base URL
- **Local**: `http://localhost:8081/api`
- **Production**: `https://your-backend-url.up.railway.app/api`

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "USER"  // Optional: USER, SUPPORT_AGENT, ADMIN
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1,
  "username": "john_doe",
  "role": "USER"
}
```

### Ticket Endpoints

#### Get All Tickets
```http
GET /api/tickets
Authorization: Bearer <token>
```

#### Get My Tickets
```http
GET /api/tickets/my-tickets
Authorization: Bearer <token>
```

#### Get Ticket by ID
```http
GET /api/tickets/{id}
Authorization: Bearer <token>
```

#### Create Ticket
```http
POST /api/tickets
Authorization: Bearer <token>
Content-Type: application/json

{
  "subject": "Unable to login",
  "description": "I cannot access my account",
  "priority": "HIGH",  // LOW, MEDIUM, HIGH, URGENT
  "assignedToId": 2    // Optional
}
```

#### Update Ticket
```http
PUT /api/tickets/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "subject": "Updated subject",
  "description": "Updated description",
  "priority": "MEDIUM"
}
```

#### Update Ticket Status
```http
PUT /api/tickets/{id}/status?status=RESOLVED
Authorization: Bearer <token>
```

**Status Values**: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`

#### Assign Ticket
```http
PUT /api/tickets/{id}/assign?assignedToId=2
Authorization: Bearer <token>
```

#### Search Tickets
```http
GET /api/tickets/search?status=OPEN&priority=HIGH&search=login
Authorization: Bearer <token>
```

### Comment Endpoints

#### Get Comments
```http
GET /api/comments/ticket/{ticketId}
Authorization: Bearer <token>
```

#### Add Comment
```http
POST /api/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "ticketId": 1,
  "content": "This is a comment"
}
```

### User Endpoints

#### Get Current User
```http
GET /api/users/me
Authorization: Bearer <token>
```

#### Get Support Agents
```http
GET /api/users/support-agents
Authorization: Bearer <token>
```

### Admin Endpoints

All admin endpoints require `ADMIN` role.

#### Get All Users
```http
GET /api/admin/users
Authorization: Bearer <token>
```

#### Create User
```http
POST /api/admin/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "new_user",
  "email": "user@example.com",
  "password": "password123",
  "role": "SUPPORT_AGENT"
}
```

#### Update User
```http
PUT /api/admin/users/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "updated_user",
  "email": "updated@example.com",
  "role": "ADMIN"
}
```

#### Delete User
```http
DELETE /api/admin/users/{id}
Authorization: Bearer <token>
```

#### Get All Tickets (Admin)
```http
GET /api/admin/tickets
Authorization: Bearer <token>
```

## 🔧 Environment Variables

### Backend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | `8081` | No (auto-set on Railway) |
| `DATABASE_URL` | PostgreSQL connection string | - | Yes (production) |
| `JWT_SECRET` | Secret key for JWT tokens (min 32 bytes) | - | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` | Yes (production) |
| `STORAGE_PATH` | File upload storage path | `uploads` | No |

### Frontend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8081/api` | Yes (production) |

### Local Development

Create `.env.local` in `ticketing-system-frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8081/api
```

### Production (Railway)

Set these in Railway Dashboard → Service → Variables:

**Backend:**
- `DATABASE_URL` - Add reference to PostgreSQL database
- `JWT_SECRET` - Generate using: `openssl rand -base64 32`
- `FRONTEND_URL` - Your frontend Railway URL

**Frontend:**
- `NEXT_PUBLIC_API_URL` - Your backend Railway URL + `/api`

## 👥 User Roles

### USER
- Create and manage own tickets
- View own tickets
- Add comments to own tickets
- Rate resolved tickets

### SUPPORT_AGENT
- All USER permissions
- View all tickets
- Assign tickets to users
- Update ticket status
- Add comments to any ticket

### ADMIN
- All SUPPORT_AGENT permissions
- Manage users (CRUD operations)
- View all tickets with admin privileges
- Force update ticket status
- Force assign tickets

## 🐛 Troubleshooting

### Common Issues

#### Backend won't start
- ✅ Check PostgreSQL is running
- ✅ Verify database credentials in `application.properties`
- ✅ Ensure port 8081 is not in use

#### Frontend can't connect to backend
- ✅ Verify `NEXT_PUBLIC_API_URL` is set correctly
- ✅ Check backend is running
- ✅ Check CORS configuration

#### Database connection errors
- ✅ Verify `DATABASE_URL` is set correctly
- ✅ Check database is accessible
- ✅ Verify database exists

#### JWT errors
- ✅ Ensure `JWT_SECRET` is at least 32 bytes (256 bits)
- ✅ Generate new secret: `openssl rand -base64 32`

📖 **See**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed solutions.

## 🧪 Testing

### Manual Testing

1. **Register a new user**
2. **Login with credentials**
3. **Create a ticket**
4. **Add comments**
5. **Update ticket status**
6. **Test search functionality**

📖 **See**: [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive testing instructions.

### API Testing

Use tools like:
- **Postman** - API testing and documentation
- **curl** - Command-line HTTP client
- **Thunder Client** - VS Code extension

## 📝 Development Guidelines

### Code Style

- **Backend**: Follow Java naming conventions
- **Frontend**: Use TypeScript strict mode
- **Commits**: Use conventional commit messages

### Project Structure

- Keep controllers thin (delegate to services)
- Services contain business logic
- DTOs for data transfer
- Models for database entities

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Workflow

1. Create an issue describing the feature/bug
2. Assign yourself to the issue
3. Create a branch from `main`
4. Make changes and test thoroughly
5. Submit PR with description

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Authors

- **Vidhaan Viswas**

## 🙏 Acknowledgments

- Spring Boot team for the excellent framework
- Next.js team for the amazing React framework
- Railway for seamless deployment experience
- All contributors and users of this project

## 📞 Support

- **Documentation**: Check the `/Documentation` folder
- **Issues**: Open an issue on GitHub
- **Web**: https://www.vidhaanviswas.com

## 🔮 Future Enhancements

- [ ] Email notifications
- [ ] Real-time updates with WebSockets
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Cloud file storage integration (S3, Cloudinary)
- [ ] Multi-language support
- [ ] Ticket templates
- [ ] Automated ticket assignment
- [ ] SLA tracking
- [ ] Export reports (PDF, Excel)

---

**Made with ❤️ using Spring Boot and Next.js**
