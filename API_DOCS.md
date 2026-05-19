# Smart Leads Dashboard — API Documentation

Base URL: `http://localhost:5000/api/v1`

All protected endpoints require the header:
```
Authorization: Bearer <token>
```

All responses follow this shape:
```json
{
  "success": true | false,
  "message": "Human-readable message",
  "data": { ... },
  "meta": { ... },       // pagination only
  "errors": [ ... ]      // validation failures only
}
```

---

## Auth

### POST /auth/register
Register a new user.

**Body**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "Secret1234",
  "role": "sales"           // "admin" | "sales"  (default: "sales")
}
```

**201 Created**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": { "_id": "...", "name": "Jane Smith", "email": "jane@example.com", "role": "sales" },
    "token": "<jwt>"
  }
}
```

**409 Conflict** — email already registered  
**400 Bad Request** — validation errors

---

### POST /auth/login
Authenticate and receive a JWT.

**Body**
```json
{
  "email": "jane@example.com",
  "password": "Secret1234"
}
```

**200 OK**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "_id": "...", "name": "Jane Smith", "email": "jane@example.com", "role": "sales" },
    "token": "<jwt>"
  }
}
```

**401 Unauthorized** — wrong credentials

---

### GET /auth/profile
Get the authenticated user's profile. 🔒

**200 OK**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": { "user": { ... } }
}
```

---

## Leads

### GET /leads 🔒
List leads with filtering, search, sorting, and pagination.

**Query Parameters**

| Param    | Type   | Values                              | Default  |
|----------|--------|-------------------------------------|----------|
| `status` | string | `New`, `Contacted`, `Qualified`, `Lost` | —    |
| `source` | string | `Website`, `Instagram`, `Referral`  | —        |
| `search` | string | any string (searches name + email)  | —        |
| `sort`   | string | `latest`, `oldest`                  | `latest` |
| `page`   | number | ≥ 1                                 | `1`      |
| `limit`  | number | 1–100                               | `10`     |

Multiple filters are combined with AND logic.

**200 OK**
```json
{
  "success": true,
  "message": "Leads retrieved successfully",
  "data": { "leads": [ { ... }, { ... } ] },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

> **Role behaviour:** `admin` sees all leads; `sales` sees only their own.

---

### GET /leads/stats 🔒
Aggregated counts by status and source.

**200 OK**
```json
{
  "success": true,
  "message": "Stats retrieved",
  "data": {
    "totalCount": 42,
    "statusStats": [
      { "_id": "New", "count": 12 },
      { "_id": "Qualified", "count": 8 }
    ],
    "sourceStats": [
      { "_id": "Instagram", "count": 20 }
    ]
  }
}
```

---

### GET /leads/export 🔒 Admin only
Download all (filtered) leads as a CSV file.

**Query Parameters** — same as `GET /leads` (except `page`, `limit`, `sort`)

**200 OK** — `Content-Type: text/csv`, binary body

---

### GET /leads/:id 🔒

**200 OK**
```json
{
  "success": true,
  "message": "Lead retrieved successfully",
  "data": { "lead": { ... } }
}
```

**404** — not found  
**403** — sales user accessing someone else's lead

---

### POST /leads 🔒
Create a new lead.

**Body**
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "status": "New",
  "source": "Instagram",
  "notes": "Met at conference"
}
```

**201 Created**
```json
{
  "success": true,
  "message": "Lead created successfully",
  "data": { "lead": { ... } }
}
```

---

### PUT /leads/:id 🔒
Partial update — send only the fields to change.

**Body** (all fields optional)
```json
{
  "status": "Qualified",
  "notes": "Follow-up scheduled"
}
```

**200 OK** — returns updated lead  
**403** — sales user updating another's lead  
**404** — not found

---

### DELETE /leads/:id 🔒

**200 OK**
```json
{ "success": true, "message": "Lead deleted successfully", "data": null }
```

**403** — sales user deleting another's lead  
**404** — not found

---

## Error Responses

| Status | Meaning                      |
|--------|------------------------------|
| 400    | Validation error             |
| 401    | Missing / expired / bad JWT  |
| 403    | Insufficient permissions     |
| 404    | Resource not found           |
| 409    | Conflict (duplicate email)   |
| 429    | Rate limit exceeded          |
| 500    | Internal server error        |

Validation error shape:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email address" }
  ]
}
```

---

## Rate Limiting

All `/api/` routes are limited to **100 requests per 15 minutes** per IP.
