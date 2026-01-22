# Ticketing System Backend

Spring Boot backend for the Ticketing System application.

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- PostgreSQL 12+

## Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE ticketing_system;
```

2. Update `src/main/resources/application.properties` with your database credentials:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/ticketing_system
spring.datasource.username=your_username
spring.datasource.password=your_password
```

3. Build and run the application:
```bash
mvn clean install
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login

### Tickets
- `GET /api/tickets` - Get all tickets (requires authentication)
- `GET /api/tickets/my-tickets` - Get current user's tickets
- `GET /api/tickets/{id}` - Get ticket by ID
- `POST /api/tickets` - Create a new ticket
- `PUT /api/tickets/{id}` - Update a ticket
- `PUT /api/tickets/{id}/status` - Update ticket status
- `PUT /api/tickets/{id}/assign` - Assign ticket to a user
- `GET /api/tickets/search` - Search tickets with filters

### Comments
- `GET /api/comments/ticket/{ticketId}` - Get comments for a ticket
- `POST /api/comments` - Add a comment to a ticket

### Users
- `GET /api/users/me` - Get current user
- `GET /api/users/support-agents` - Get all support agents

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `POST /api/admin/users` - Create a user (admin only)
- `PUT /api/admin/users/{id}` - Update a user (admin only)
- `DELETE /api/admin/users/{id}` - Delete a user (admin only)
- `GET /api/admin/tickets` - Get all tickets (admin only)

## Default Roles

- `USER` - Regular users who can create and manage their own tickets
- `SUPPORT_AGENT` - Can view all tickets, assign tickets, and change statuses
- `ADMIN` - Full access to all features including user management
