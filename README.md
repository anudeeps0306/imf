
## Overview

The IMF Gadget API provides a secure interface for managing the Impossible Missions Force's gadget inventory. It includes features such as:

- User authentication and role-based authorization
- Complete CRUD operations for gadgets
- Random codename generation for new gadgets
- Mission success probability calculation
- Self-destruct sequence with confirmation codes
- Soft delete functionality (decommissioning)

## Technologies

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **PostgreSQL** - Database
- **Prisma** - ORM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Helmet** - Security headers
- **Express Rate Limit** - Rate limiting

## Getting Started

### Prerequisites

- Node.js (v14+)
- PostgreSQL (v12+)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/imf-gadget-api.git
   cd imf-gadget-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/imf_gadgets?schema=public"

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=24h

# API
API_RATE_LIMIT=100
```

## Database Schema

The API uses the following database schema:

### User
- `id` (UUID): Primary key
- `username` (String): Unique username
- `password` (String): Hashed password
- `role` (String): User role (admin or agent)
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Update timestamp

### Gadget
- `id` (UUID): Primary key
- `name` (String): Gadget name
- `codename` (String): Unique randomly generated codename
- `status` (String): Current status (Available, Deployed, Destroyed, Decommissioned)
- `decommissionedAt` (DateTime): Timestamp when gadget was decommissioned
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Update timestamp

### SelfDestructCode
- `id` (UUID): Primary key
- `code` (String): Self-destruct confirmation code
- `gadgetId` (String): Foreign key to Gadget
- `used` (Boolean): Whether the code has been used
- `createdAt` (DateTime): Creation timestamp
- `usedAt` (DateTime): Timestamp when code was used

## API Endpoints

All API responses follow this format:

```json
{
  "status": 200,
  "message": "Success message",
  "data": {},
  "timestamp": "2023-02-15T12:34:56.789Z"
}
```

### Authentication

#### Register a new user

```
POST /api/auth/register
```

**Request Body:**
```json
{
  "username": "agent007",
  "password": "secret123",
  "role": "agent" // Optional, defaults to "agent"
}
```

**Response (201 Created):**
```json
{
  "status": 201,
  "message": "User registered successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "username": "agent007",
    "role": "agent",
    "createdAt": "2023-02-15T12:34:56.789Z"
  },
  "timestamp": "2023-02-15T12:34:56.789Z"
}
```

#### Login

```
POST /api/auth/login
```

**Request Body:**
```json
{
  "username": "agent007",
  "password": "secret123"
}
```

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "username": "agent007",
      "role": "agent"
    }
  },
  "timestamp": "2023-02-15T12:34:56.789Z"
}
```

### Gadgets

All gadget endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer your_jwt_token_here
```

#### Get all gadgets

```
GET /api/gadgets
```

**Query Parameters:**
- `status` (optional): Filter by status (Available, Deployed, Destroyed, Decommissioned)

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Gadgets retrieved successfully",
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Explosive Chewing Gum",
      "codename": "The Nightingale",
      "status": "Available",
      "decommissionedAt": null,
      "createdAt": "2023-02-15T12:34:56.789Z",
      "updatedAt": "2023-02-15T12:34:56.789Z",
      "successProbability": "87%"
    },
    {
      "id": "223e4567-e89b-12d3-a456-426614174001",
      "name": "Laser Watch",
      "codename": "Operation Falcon",
      "status": "Deployed",
      "decommissionedAt": null,
      "createdAt": "2023-02-14T10:24:36.789Z",
      "updatedAt": "2023-02-14T10:24:36.789Z",
      "successProbability": "92%"
    }
  ],
  "timestamp": "2023-02-15T12:34:56.789Z"
}
```

#### Get a gadget by ID

```
GET /api/gadgets/:id
```

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Gadget retrieved successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Explosive Chewing Gum",
    "codename": "The Nightingale",
    "status": "Available",
    "decommissionedAt": null,
    "createdAt": "2023-02-15T12:34:56.789Z",
    "updatedAt": "2023-02-15T12:34:56.789Z",
    "successProbability": "87%"
  },
  "timestamp": "2023-02-15T12:34:56.789Z"
}
```

#### Create a new gadget

```
POST /api/gadgets
```

**Authorization:** Admin role required

**Request Body:**
```json
{
  "name": "Explosive Chewing Gum"
}
```

**Response (201 Created):**
```json
{
  "status": 201,
  "message": "Gadget created successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Explosive Chewing Gum",
    "codename": "The Nightingale",
    "status": "Available",
    "decommissionedAt": null,
    "createdAt": "2023-02-15T12:34:56.789Z",
    "updatedAt": "2023-02-15T12:34:56.789Z"
  },
  "timestamp": "2023-02-15T12:34:56.789Z"
}
```

#### Update a gadget

```
PATCH /api/gadgets/:id
```

**Authorization:** Admin role required

**Request Body:**
```json
{
  "name": "Updated Gadget Name",
  "status": "Deployed"
}
```

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Gadget updated successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Updated Gadget Name",
    "codename": "The Nightingale",
    "status": "Deployed",
    "decommissionedAt": null,
    "createdAt": "2023-02-15T12:34:56.789Z",
    "updatedAt": "2023-02-15T13:45:12.345Z"
  },
  "timestamp": "2023-02-15T13:45:12.345Z"
}
```

#### Delete a gadget (mark as decommissioned)

```
DELETE /api/gadgets/:id
```

**Authorization:** Admin role required

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Gadget decommissioned successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Explosive Chewing Gum",
    "codename": "The Nightingale",
    "status": "Decommissioned",
    "decommissionedAt": "2023-02-15T14:22:33.456Z",
    "createdAt": "2023-02-15T12:34:56.789Z",
    "updatedAt": "2023-02-15T14:22:33.456Z"
  },
  "timestamp": "2023-02-15T14:22:33.456Z"
}
```

#### Trigger self-destruct sequence

Step 1: Request a confirmation code

```
POST /api/gadgets/:id/self-destruct
```

**Authorization:** Admin or Agent role required

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Self-destruct sequence initiated. Use the provided code to confirm.",
  "data": {
    "code": "ABC123"
  },
  "timestamp": "2023-02-15T15:10:45.678Z"
}
```

Step 2: Confirm self-destruct with code

```
POST /api/gadgets/:id/self-destruct
```

**Authorization:** Admin or Agent role required

**Request Body:**
```json
{
  "confirmationCode": "ABC123"
}
```

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Gadget has been destroyed",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Explosive Chewing Gum",
    "codename": "The Nightingale",
    "status": "Destroyed",
    "decommissionedAt": null,
    "createdAt": "2023-02-15T12:34:56.789Z",
    "updatedAt": "2023-02-15T15:12:22.345Z"
  },
  "timestamp": "2023-02-15T15:12:22.345Z"
}
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

**400 Bad Request:**
```json
{
  "status": 400,
  "message": "Gadget name is required",
  "timestamp": "2023-02-15T12:34:56.789Z"
}
```

**401 Unauthorized:**
```json
{
  "status": 401,
  "message": "Authentication required",
  "timestamp": "2023-02-15T12:34:56.789Z"
}
```

**403 Forbidden:**
```json
{
  "status": 403,
  "message": "Insufficient permissions",
  "timestamp": "2023-02-15T12:34:56.789Z"
}
```

**404 Not Found:**
```json
{
  "status": 404,
  "message": "Gadget not found",
  "timestamp": "2023-02-15T12:34:56.789Z"
}
```

**409 Conflict:**
```json
{
  "status": 409,
  "message": "Username already taken",
  "timestamp": "2023-02-15T12:34:56.789Z"
}
```

**429 Too Many Requests:**
```json
{
  "status": 429,
  "message": "Too many requests, please try again later.",
  "timestamp": "2023-02-15T12:34:56.789Z"
}
```

**500 Internal Server Error:**
```json
{
  "status": 500,
  "message": "Internal server error",
  "timestamp": "2023-02-15T12:34:56.789Z"
}
```
