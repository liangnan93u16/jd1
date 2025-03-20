-- Create enums first
CREATE TYPE busy_level AS ENUM ('1', '2', '3', '4');
CREATE TYPE importance_level AS ENUM ('A', 'B', 'C');

-- 基地表
CREATE TABLE base (
    base_id SERIAL PRIMARY KEY,
    base_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 车间表
CREATE TABLE workshop (
    workshop_id SERIAL PRIMARY KEY,
    base_id INTEGER NOT NULL,
    workshop_name VARCHAR(100) NOT NULL,
    busy_level busy_level NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (base_id) REFERENCES base(base_id)
);

-- 设备类型表
CREATE TABLE equipment_type (
    type_id SERIAL PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL,
    lifecycle_years INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 设备表
CREATE TABLE equipment (
    equipment_id SERIAL PRIMARY KEY,
    workshop_id INTEGER NOT NULL,
    type_id INTEGER NOT NULL,
    equipment_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workshop_id) REFERENCES workshop(workshop_id),
    FOREIGN KEY (type_id) REFERENCES equipment_type(type_id)
);

-- 部件表
CREATE TABLE component (
    component_id SERIAL PRIMARY KEY,
    type_id INTEGER NOT NULL,
    component_name VARCHAR(100) NOT NULL,
    importance_level importance_level NOT NULL,
    failure_rate DECIMAL(5,2),
    lifecycle_years INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (type_id) REFERENCES equipment_type(type_id)
);

-- 备件(物料)表
CREATE TABLE spare_part (
    spare_part_id SERIAL PRIMARY KEY,
    material_code VARCHAR(50) NOT NULL UNIQUE,
    manufacturer VARCHAR(100) NOT NULL,
    manufacturer_material_code VARCHAR(50),
    specification VARCHAR(100),
    description TEXT,
    is_custom BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 备件供应商表
CREATE TABLE spare_part_supplier (
    supplier_id SERIAL PRIMARY KEY,
    spare_part_id INTEGER NOT NULL,
    supplier_name VARCHAR(100) NOT NULL,
    supply_cycle_weeks INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (spare_part_id) REFERENCES spare_part(spare_part_id)
);

-- 设备部件-备件关联表
CREATE TABLE equipment_component_spare_part (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER NOT NULL,
    component_id INTEGER NOT NULL,
    spare_part_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment(equipment_id),
    FOREIGN KEY (component_id) REFERENCES component(component_id),
    FOREIGN KEY (spare_part_id) REFERENCES spare_part(spare_part_id)
);

-- 用户表
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);