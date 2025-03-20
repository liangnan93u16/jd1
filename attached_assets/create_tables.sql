-- 基地表
CREATE TABLE base (
    base_id INT PRIMARY KEY AUTO_INCREMENT,
    base_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 车间表
CREATE TABLE workshop (
    workshop_id INT PRIMARY KEY AUTO_INCREMENT,
    base_id INT NOT NULL,
    workshop_name VARCHAR(100) NOT NULL,
    busy_level ENUM('1', '2', '3', '4') NOT NULL COMMENT '1:连续作业 2:正常作业 3:间歇作业 4:不作业',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (base_id) REFERENCES base(base_id)
);

-- 设备类型表
CREATE TABLE equipment_type (
    type_id INT PRIMARY KEY AUTO_INCREMENT,
    type_name VARCHAR(100) NOT NULL,
    lifecycle_years INT COMMENT '设备整体生命周期(年)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 设备表
CREATE TABLE equipment (
    equipment_id INT PRIMARY KEY AUTO_INCREMENT,
    workshop_id INT NOT NULL,
    type_id INT NOT NULL,
    equipment_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (workshop_id) REFERENCES workshop(workshop_id),
    FOREIGN KEY (type_id) REFERENCES equipment_type(type_id)
);

-- 部件表
CREATE TABLE component (
    component_id INT PRIMARY KEY AUTO_INCREMENT,
    type_id INT NOT NULL,
    component_name VARCHAR(100) NOT NULL,
    importance_level ENUM('A', 'B', 'C') NOT NULL COMMENT 'A:核心部件 B:一般重要性 C:不重要',
    failure_rate DECIMAL(5,2) COMMENT '损坏率(百分比)',
    lifecycle_years INT COMMENT '部件生命周期(年)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (type_id) REFERENCES equipment_type(type_id)
);

-- 备件(物料)表
CREATE TABLE spare_part (
    spare_part_id INT PRIMARY KEY AUTO_INCREMENT,
    material_code VARCHAR(50) NOT NULL UNIQUE COMMENT '物料编号',
    manufacturer VARCHAR(100) NOT NULL COMMENT '制造商',
    manufacturer_material_code VARCHAR(50) COMMENT '制造商的物料编号',
    specification VARCHAR(100) COMMENT '规格型号',
    description TEXT COMMENT '物料描述',
    is_custom BOOLEAN DEFAULT FALSE COMMENT '是否是定制件',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 备件供应商表
CREATE TABLE spare_part_supplier (
    supplier_id INT PRIMARY KEY AUTO_INCREMENT,
    spare_part_id INT NOT NULL,
    supplier_name VARCHAR(100) NOT NULL,
    supply_cycle_weeks INT NOT NULL COMMENT '供货周期(周)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (spare_part_id) REFERENCES spare_part(spare_part_id)
);

-- 设备部件-备件关联表
CREATE TABLE equipment_component_spare_part (
    id INT PRIMARY KEY AUTO_INCREMENT,
    equipment_id INT NOT NULL,
    component_id INT NOT NULL,
    spare_part_id INT NOT NULL,
    quantity INT DEFAULT 1 COMMENT '所需备件数量',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment(equipment_id),
    FOREIGN KEY (component_id) REFERENCES component(component_id),
    FOREIGN KEY (spare_part_id) REFERENCES spare_part(spare_part_id)
); 