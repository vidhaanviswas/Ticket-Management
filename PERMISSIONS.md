# Permission Model & Security

## 🔐 Endpoint Permissions

### Public Endpoints (No Authentication Required)
- `POST /api/auth/register` - Public registration (always creates USER role)
- `POST /api/auth/login` - Public login

### Authenticated Endpoints (Requires Valid JWT Token)

#### Ticket Endpoints (`/api/tickets/**`)

| Endpoint | Method | USER | SUPPORT_AGENT | ADMIN |
|----------|--------|------|---------------|-------|
| `/api/tickets` | POST | ✅ Create own tickets | ✅ Create tickets | ✅ Create tickets |
| `/api/tickets/my-tickets` | GET | ✅ View own tickets | ✅ View own tickets | ✅ View own tickets |
| `/api/tickets` | GET | ❌ Forbidden | ✅ View assigned + created | ✅ View all tickets |
| `/api/tickets/{id}` | GET | ✅ Own tickets only | ✅ Assigned + created | ✅ All tickets |
| `/api/tickets/{id}` | PUT | ✅ Own tickets only | ✅ Assigned + created | ✅ All tickets |
| `/api/tickets/{id}/status` | PUT | ❌ **Forbidden** | ✅ **If assigned** | ✅ **All tickets** |
| `/api/tickets/{id}/assign` | PUT | ❌ **Forbidden** | ❌ **Forbidden** | ✅ **All tickets** |
| `/api/tickets/search` | GET | ❌ Forbidden | ✅ Assigned + created | ✅ All tickets |

#### Admin Endpoints (`/api/admin/**`)

| Endpoint | Method | USER | SUPPORT_AGENT | ADMIN |
|----------|--------|------|---------------|-------|
| `/api/admin/**` | ALL | ❌ **Forbidden** | ❌ **Forbidden** | ✅ **Full Access** |

**Note**: All admin endpoints require `ADMIN` role. Spring Security enforces this at the URL level.

## ✅ Security Verification

### Test 1: Regular User Cannot Update Status

```bash
# Login as regular user
POST /api/auth/login
{
  "username": "user1",
  "password": "user1"
}
# Get token from response

# Try to update ticket status (should FAIL)
PUT /api/tickets/1/status?status=RESOLVED
Authorization: Bearer <user_token>

# Expected: 403 Forbidden
# Message: "You don't have permission to change ticket status"
```

### Test 2: Admin Can Update Status (Expected Behavior)

```bash
# Login as admin
POST /api/auth/login
{
  "username": "admin",
  "password": "admin_password"
}
# Get token from response

# Update ticket status (should SUCCEED)
PUT /api/tickets/1/status?status=RESOLVED
Authorization: Bearer <admin_token>

# Expected: 200 OK
# This is CORRECT - admins should be able to update status
```

### Test 3: Support Agent Can Only Update Assigned Tickets

```bash
# Login as support agent
POST /api/auth/login
{
  "username": "sa1",
  "password": "sa1"
}
# Get token from response

# Try to update unassigned ticket (should FAIL)
PUT /api/tickets/1/status?status=RESOLVED
Authorization: Bearer <agent_token>

# Expected: 403 Forbidden (if ticket not assigned to this agent)
# Expected: 200 OK (if ticket IS assigned to this agent)
```

## 🔒 Current Security Status

### ✅ Properly Protected

1. **Authentication Required**: All ticket endpoints require valid JWT token
2. **Role-Based Authorization**: Permissions checked in service layer
3. **Status Update Protection**: Only ADMIN and assigned SUPPORT_AGENT can update
4. **Assignment Protection**: Only ADMIN can assign tickets
5. **Admin Endpoints**: Protected at Spring Security level (requires ADMIN role)

### Permission Checks in Code

**Status Update** (`TicketService.updateTicketStatus`):
```java
// Line 152-160
if (currentUser.getRole().equals(User.Role.ADMIN)) {
    // Admin can update any ticket status ✅
} else if (currentUser.getRole().equals(User.Role.SUPPORT_AGENT)) {
    // Agent can only update if assigned ✅
    if (ticket.getAssignedTo() == null || !ticket.getAssignedTo().getId().equals(currentUser.getId())) {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, ...);
    }
} else {
    // Regular users cannot update status ✅
    throw new ResponseStatusException(HttpStatus.FORBIDDEN, ...);
}
```

## 🧪 Security Testing Checklist

- [ ] Regular user cannot update ticket status
- [ ] Regular user cannot assign tickets
- [ ] Regular user cannot access admin endpoints
- [ ] Support agent can only update assigned tickets
- [ ] Support agent cannot assign tickets
- [ ] Support agent cannot access admin endpoints
- [ ] Admin can update any ticket status ✅ (This is correct!)
- [ ] Admin can assign tickets
- [ ] Admin can access all admin endpoints

## 📝 Summary

**Your observation is CORRECT and SECURE:**

✅ Admin can update ticket status via Postman - **This is expected behavior**
✅ Regular users cannot update status - **Protected by permission checks**
✅ Support agents can only update assigned tickets - **Protected by permission checks**

The endpoint is properly secured:
1. Requires authentication (JWT token)
2. Checks user role
3. Enforces business rules (agents can only update assigned tickets)
4. Returns proper error messages for unauthorized access

**This is not a security vulnerability - it's working as designed!**
