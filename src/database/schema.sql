-- Role-Based Authentication System Database Schema

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: tbl_permission_groups
CREATE TABLE IF NOT EXISTS tbl_permission_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: tbl_permissions
CREATE TABLE IF NOT EXISTS tbl_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    permission_group_id UUID REFERENCES tbl_permission_groups(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: tbl_group_permission_mapping
CREATE TABLE IF NOT EXISTS tbl_group_permission_mapping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    permission_group_id UUID NOT NULL REFERENCES tbl_permission_groups(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES tbl_permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(permission_group_id, permission_id)
);

-- Table: tbl_role
CREATE TABLE IF NOT EXISTS tbl_role (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: tbl_role_permissions
CREATE TABLE IF NOT EXISTS tbl_role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES tbl_role(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES tbl_permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, permission_id)
);

-- Table: tbl_users
CREATE TABLE IF NOT EXISTS tbl_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id UUID REFERENCES tbl_role(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_role_id ON tbl_users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON tbl_users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON tbl_users(username);
CREATE INDEX IF NOT EXISTS idx_permissions_group_id ON tbl_permissions(permission_group_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON tbl_role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON tbl_role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_group_permission_mapping_group_id ON tbl_group_permission_mapping(permission_group_id);
CREATE INDEX IF NOT EXISTS idx_group_permission_mapping_permission_id ON tbl_group_permission_mapping(permission_id);

-- Create session table for express-session
CREATE TABLE IF NOT EXISTS "session" (
    "sid" VARCHAR NOT NULL COLLATE "default",
    "sess" JSON NOT NULL,
    "expire" TIMESTAMP(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");

