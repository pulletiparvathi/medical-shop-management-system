-- Medical Shop Management System Schema DDL
-- Database: PostgreSQL 14+

-- 1. Users Table
CREATE TABLE accounts_user (
    id BIGSERIAL PRIMARY KEY,
    password VARCHAR(128) NOT NULL,
    last_login TIMESTAMPTZ,
    is_superuser BOOLEAN NOT NULL DEFAULT FALSE,
    email VARCHAR(254) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
    is_staff BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_accounts_user_email ON accounts_user(email);
CREATE INDEX idx_accounts_user_role ON accounts_user(role);

-- 2. Medical Shops Table
CREATE TABLE shops_medicalshop (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE,
    shop_name VARCHAR(200) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(254) NOT NULL,
    address TEXT NOT NULL,
    area VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL DEFAULT 'Telangana',
    pincode VARCHAR(10) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL DEFAULT 17.4455,
    longitude DOUBLE PRECISION NOT NULL DEFAULT 78.3846,
    opening_time TIME NOT NULL DEFAULT '08:00:00',
    closing_time TIME NOT NULL DEFAULT '22:00:00',
    description TEXT,
    shop_image VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shops_shop_name ON shops_medicalshop(shop_name);
CREATE INDEX idx_shops_city ON shops_medicalshop(city);
CREATE INDEX idx_shops_pincode ON shops_medicalshop(pincode);
CREATE INDEX idx_shops_active_verified ON shops_medicalshop(is_active, is_verified);

-- 3. Medicine Master Catalog Table
CREATE TABLE medicines_medicine (
    id BIGSERIAL PRIMARY KEY,
    medicine_name VARCHAR(200) NOT NULL,
    generic_name VARCHAR(200) NOT NULL,
    brand_name VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    dosage VARCHAR(50) NOT NULL,
    dosage_form VARCHAR(50) NOT NULL DEFAULT 'Tablet',
    manufacturer VARCHAR(200) NOT NULL,
    description TEXT,
    prescription_required BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_medicine_dosage UNIQUE (medicine_name, dosage, dosage_form)
);

CREATE INDEX idx_medicines_name ON medicines_medicine(medicine_name);
CREATE INDEX idx_medicines_generic ON medicines_medicine(generic_name);
CREATE INDEX idx_medicines_brand ON medicines_medicine(brand_name);
CREATE INDEX idx_medicines_category ON medicines_medicine(category);

-- 4. Shop Inventory (ShopMedicine) Table
CREATE TABLE inventory_shopmedicine (
    id BIGSERIAL PRIMARY KEY,
    shop_id BIGINT NOT NULL REFERENCES shops_medicalshop(id) ON DELETE CASCADE,
    medicine_id BIGINT NOT NULL REFERENCES medicines_medicine(id) ON DELETE CASCADE,
    quantity INT CHECK (quantity >= 0) NOT NULL DEFAULT 0,
    price NUMERIC(10, 2) CHECK (price > 0) NOT NULL,
    batch_number VARCHAR(100) NOT NULL,
    expiry_date DATE NOT NULL,
    minimum_stock_level INT CHECK (minimum_stock_level >= 0) NOT NULL DEFAULT 10,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_shop_medicine_batch UNIQUE (shop_id, medicine_id, batch_number)
);

CREATE INDEX idx_inventory_quantity ON inventory_shopmedicine(quantity);
CREATE INDEX idx_inventory_expiry ON inventory_shopmedicine(expiry_date);
CREATE INDEX idx_inventory_available ON inventory_shopmedicine(is_available);
