# Role-Based Authentication System

Node.js + TypeScript + Express + PostgreSQL RBAC with cookie-based, server-side sessions.

## Implemented Features

- Cookie-based authentication (Express-Session + Postgres store)
- Session-backed login/logout and current user endpoint
- RBAC entities and CRUD:
  - Users, Roles, Permissions, Permission Groups
  - Role-Permission mapping, Group-Permission mapping
- Zod validation for request bodies
- Centralized middleware: auth, validation, error handler
- Raw SQL schema + simple migration runner
- Swagger UI served from an OpenAPI file (`docs/openapi.yaml`)

## Tech Stack
- Node.js, TypeScript, Express
- PostgreSQL (`pg`), sessions persisted in Postgres
- Zod for validation, bcryptjs for password hashing

## Prerequisites
- Node.js 18+
- PostgreSQL 12+

## Environment Variables (.env)
Create `.env` in project root:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/role_based_auth
# If your provider requires SSL (Render, Neon, Supabase, Railway, etc.)
DATABASE_SSL=true

# Session
SESSION_SECRET=change-me
SESSION_NAME=rbac_session

# Server
PORT=3000
NODE_ENV=development

# Cookies
COOKIE_SECURE=false
COOKIE_HTTP_ONLY=true
COOKIE_SAME_SITE=lax

# CORS
CORS_ORIGIN=http://localhost:3000
```

Render example (copy exact External Connection String):
```env
DATABASE_URL=postgresql://user:password@dpg-xxxxx.region-postgres.render.com:5432/db_name
DATABASE_SSL=true
```

## Install & Run

```bash
npm install
npm run migrate   # creates tables and indexes
npm run dev       # starts http://localhost:3000
```

If migration fails with SSL/TLS errors, set `DATABASE_SSL=true`. If it fails with hostname not found, ensure your `DATABASE_URL` host is complete (includes domain and port).

## API Overview

Base URL: `http://localhost:3000`

- Auth
  - POST `/api/auth/register`
  - POST `/api/auth/login`
  - POST `/api/auth/logout`
  - GET  `/api/auth/me` (requires session)
- Users (requires session)
  - GET `/api/users`
  - GET `/api/users/:id`
  - POST `/api/users`
  - PUT `/api/users/:id`
  - DELETE `/api/users/:id`
- Roles (requires session)
  - GET `/api/roles`
  - GET `/api/roles/:id`
  - POST `/api/roles`
  - PUT `/api/roles/:id`
  - DELETE `/api/roles/:id`
- Permissions (requires session)
  - GET `/api/permissions`
  - GET `/api/permissions/:id`
  - POST `/api/permissions`
  - PUT `/api/permissions/:id`
  - DELETE `/api/permissions/:id`
- Permission Groups (requires session)
  - GET `/api/permission-groups`
  - GET `/api/permission-groups/:id`
  - POST `/api/permission-groups`
  - PUT `/api/permission-groups/:id`
  - DELETE `/api/permission-groups/:id`
- Role Permissions (requires session)
  - GET `/api/roles/:roleId/permissions`
  - POST `/api/role-permissions`
  - DELETE `/api/role-permissions/:roleId/:permissionId`
- Group Permission Mappings (requires session)
  - GET `/api/permission-groups/:groupId/permissions`
  - POST `/api/group-permission-mappings`
  - DELETE `/api/group-permission-mappings/:groupId/:permissionId`

## Swagger UI

Open: `http://localhost:3000/api-docs`

- The spec is loaded from `docs/openapi.yaml`.
- Authentication uses cookie-based sessions (`cookieAuth`) with cookie name from `SESSION_NAME` (default `rbac_session`).
- Same-origin usage (recommended): After logging in via `/api/auth/login` in Swagger, the browser stores the cookie automatically and protected routes work.
- Cross-origin usage: Click "Authorize" → for `cookieAuth` enter `rbac_session=<value>` (copy from DevTools → Application/Storage → Cookies) or use cURL with a cookie jar (below).

## Testing with cURL (copy-paste)

Use `cookies.txt` to persist the session cookie between requests.

### 1) Authentication

Register:
```bash
curl -i -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@example.com","password":"Passw0rd!"}'
```

Login (save cookie):
```bash
curl -i -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Passw0rd!"}'
```

Current user (uses cookie):
```bash
curl -i -b cookies.txt http://localhost:3000/api/auth/me
```

Logout:
```bash
curl -i -b cookies.txt -X POST http://localhost:3000/api/auth/logout
```

### 2) Users

List:
```bash
curl -i -b cookies.txt http://localhost:3000/api/users
```

Create:
```bash
curl -i -b cookies.txt -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@example.com","password":"Passw0rd!","is_active":true}'
```

Get by id:
```bash
curl -i -b cookies.txt http://localhost:3000/api/users/<user_id>
```

Update:
```bash
curl -i -b cookies.txt -X PUT http://localhost:3000/api/users/<user_id> \
  -H "Content-Type: application/json" \
  -d '{"email":"john+updated@example.com"}'
```

Delete:
```bash
curl -i -b cookies.txt -X DELETE http://localhost:3000/api/users/<user_id>
```

### 3) Roles

List:
```bash
curl -i -b cookies.txt http://localhost:3000/api/roles
```

Create:
```bash
curl -i -b cookies.txt -X POST http://localhost:3000/api/roles \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","description":"Full access"}'
```

Get by id:
```bash
curl -i -b cookies.txt http://localhost:3000/api/roles/<role_id>
```

Update:
```bash
curl -i -b cookies.txt -X PUT http://localhost:3000/api/roles/<role_id> \
  -H "Content-Type: application/json" \
  -d '{"description":"Updated desc"}'
```

Delete:
```bash
curl -i -b cookies.txt -X DELETE http://localhost:3000/api/roles/<role_id>
```

### 4) Permissions

List:
```bash
curl -i -b cookies.txt http://localhost:3000/api/permissions
```

Create:
```bash
curl -i -b cookies.txt -X POST http://localhost:3000/api/permissions \
  -H "Content-Type: application/json" \
  -d '{"name":"user.read","description":"Read users"}'
```

Get by id:
```bash
curl -i -b cookies.txt http://localhost:3000/api/permissions/<permission_id>
```

Update:
```bash
curl -i -b cookies.txt -X PUT http://localhost:3000/api/permissions/<permission_id> \
  -H "Content-Type: application/json" \
  -d '{"description":"Updated"}'
```

Delete:
```bash
curl -i -b cookies.txt -X DELETE http://localhost:3000/api/permissions/<permission_id>
```

### 5) Permission Groups

List:
```bash
curl -i -b cookies.txt http://localhost:3000/api/permission-groups
```

Create:
```bash
curl -i -b cookies.txt -X POST http://localhost:3000/api/permission-groups \
  -H "Content-Type: application/json" \
  -d '{"name":"User Management","description":"User-related permissions"}'
```

Get by id:
```bash
curl -i -b cookies.txt http://localhost:3000/api/permission-groups/<group_id>
```

Update:
```bash
curl -i -b cookies.txt -X PUT http://localhost:3000/api/permission-groups/<group_id> \
  -H "Content-Type: application/json" \
  -d '{"description":"Updated"}'
```

Delete:
```bash
curl -i -b cookies.txt -X DELETE http://localhost:3000/api/permission-groups/<group_id>
```

### 6) Role-Permission Mapping

List role permissions:
```bash
curl -i -b cookies.txt http://localhost:3000/api/roles/<role_id>/permissions
```

Assign permission to role:
```bash
curl -i -b cookies.txt -X POST http://localhost:3000/api/role-permissions \
  -H "Content-Type: application/json" \
  -d '{"role_id":"<role_id>","permission_id":"<permission_id>"}'
```

Remove permission from role:
```bash
curl -i -b cookies.txt -X DELETE http://localhost:3000/api/role-permissions/<role_id>/<permission_id>
```

### 7) Group-Permission Mapping

List group permissions:
```bash
curl -i -b cookies.txt http://localhost:3000/api/permission-groups/<group_id>/permissions
```

Add permission to group:
```bash
curl -i -b cookies.txt -X POST http://localhost:3000/api/group-permission-mappings \
  -H "Content-Type: application/json" \
  -d '{"permission_group_id":"<group_id>","permission_id":"<permission_id>"}'
```

Remove permission from group:
```bash
curl -i -b cookies.txt -X DELETE http://localhost:3000/api/group-permission-mappings/<group_id>/<permission_id>
```

## Session Cookie Tips

- In Swagger (same origin), after login the browser stores the cookie automatically. Check in DevTools → Application/Storage → Cookies → `http://localhost:3000` for `rbac_session`.
- With cURL, use `-c cookies.txt` when logging in and `-b cookies.txt` for subsequent requests.
- For HTTPS/proxy deployments, set `COOKIE_SECURE=true` and add `app.set('trust proxy', 1)` before the session middleware.

## Notes
- Passwords are hashed before storage.
- Cookies are HTTP-only. Use HTTPS + `COOKIE_SECURE=true` in production.
- Sessions persist in PostgreSQL (`session` table).
- All IDs are UUIDs.