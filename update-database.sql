-- 检查现有表是否存在
SELECT 1 FROM pg_tables WHERE tablename = 'equipment_component_spare_part';

-- 为现有的equipment_component_spare_part表添加新列
ALTER TABLE equipment_component_spare_part 
ADD COLUMN IF NOT EXISTS importance_level VARCHAR(1) DEFAULT 'B',
ADD COLUMN IF NOT EXISTS supply_cycle INTEGER DEFAULT 4;

-- 检查importance_level_enum类型是否存在
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'importance_level') THEN
        CREATE TYPE importance_level AS ENUM ('A', 'B', 'C');
    END IF;
END
$$;

-- 更新已有数据的importance_level字段
UPDATE equipment_component_spare_part SET importance_level = 'A' WHERE id % 3 = 0;
UPDATE equipment_component_spare_part SET importance_level = 'B' WHERE id % 3 = 1;
UPDATE equipment_component_spare_part SET importance_level = 'C' WHERE id % 3 = 2;

-- 更新已有数据的supply_cycle字段
UPDATE equipment_component_spare_part SET supply_cycle = (id % 8) + 1;