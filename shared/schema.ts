import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Original schemas from create_tables.sql conversion
// ENUM types
export const busyLevelEnum = pgEnum('busy_level', ['1', '2', '3', '4']);
export const importanceLevelEnum = pgEnum('importance_level', ['A', 'B', 'C']);

// Base table (基地表)
export const bases = pgTable("base", {
  baseId: serial("base_id").primaryKey(),
  baseName: text("base_name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Workshop table (车间表)
export const workshops = pgTable("workshop", {
  workshopId: serial("workshop_id").primaryKey(),
  baseId: integer("base_id").notNull().references(() => bases.baseId),
  workshopName: text("workshop_name").notNull(),
  busyLevel: busyLevelEnum("busy_level").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Equipment Type table (设备类型表)
export const equipmentTypes = pgTable("equipment_type", {
  typeId: serial("type_id").primaryKey(),
  typeName: text("type_name").notNull(),
  lifecycleYears: integer("lifecycle_years"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Equipment table (设备表)
export const equipment = pgTable("equipment", {
  equipmentId: serial("equipment_id").primaryKey(),
  workshopId: integer("workshop_id").notNull().references(() => workshops.workshopId),
  typeId: integer("type_id").notNull().references(() => equipmentTypes.typeId),
  equipmentName: text("equipment_name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Component table (部件表)
export const components = pgTable("component", {
  componentId: serial("component_id").primaryKey(),
  typeId: integer("type_id").notNull().references(() => equipmentTypes.typeId),
  componentName: text("component_name").notNull(),
  importanceLevel: importanceLevelEnum("importance_level").notNull(),
  failureRate: doublePrecision("failure_rate"),
  lifecycleYears: integer("lifecycle_years"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Spare Part table (备件/物料表)
export const spareParts = pgTable("spare_part", {
  sparePartId: serial("spare_part_id").primaryKey(),
  materialCode: text("material_code").notNull().unique(),
  manufacturer: text("manufacturer").notNull(),
  manufacturerMaterialCode: text("manufacturer_material_code"),
  specification: text("specification"),
  description: text("description"),
  isCustom: boolean("is_custom").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Spare Part Supplier table (备件供应商表)
export const sparePartSuppliers = pgTable("spare_part_supplier", {
  supplierId: serial("supplier_id").primaryKey(),
  sparePartId: integer("spare_part_id").notNull().references(() => spareParts.sparePartId),
  supplierName: text("supplier_name").notNull(),
  supplyCycleWeeks: integer("supply_cycle_weeks").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Equipment Component Spare Part association table (设备部件-备件关联表)
export const equipmentComponentSpareParts = pgTable("equipment_component_spare_part", {
  id: serial("id").primaryKey(),
  equipmentId: integer("equipment_id").notNull().references(() => equipment.equipmentId),
  componentId: integer("component_id").notNull().references(() => components.componentId),
  sparePartId: integer("spare_part_id").notNull().references(() => spareParts.sparePartId),
  quantity: integer("quantity").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const basesRelations = relations(bases, ({ many }) => ({
  workshops: many(workshops),
}));

export const workshopsRelations = relations(workshops, ({ one, many }) => ({
  base: one(bases, {
    fields: [workshops.baseId],
    references: [bases.baseId],
  }),
  equipment: many(equipment),
}));

export const equipmentTypesRelations = relations(equipmentTypes, ({ many }) => ({
  equipment: many(equipment),
  components: many(components),
}));

export const equipmentRelations = relations(equipment, ({ one, many }) => ({
  workshop: one(workshops, {
    fields: [equipment.workshopId],
    references: [workshops.workshopId],
  }),
  type: one(equipmentTypes, {
    fields: [equipment.typeId],
    references: [equipmentTypes.typeId],
  }),
  equipmentComponentSpareParts: many(equipmentComponentSpareParts),
}));

export const componentsRelations = relations(components, ({ one, many }) => ({
  type: one(equipmentTypes, {
    fields: [components.typeId],
    references: [equipmentTypes.typeId],
  }),
  equipmentComponentSpareParts: many(equipmentComponentSpareParts),
}));

export const sparePartsRelations = relations(spareParts, ({ many }) => ({
  suppliers: many(sparePartSuppliers),
  equipmentComponentSpareParts: many(equipmentComponentSpareParts),
}));

export const sparePartSuppliersRelations = relations(sparePartSuppliers, ({ one }) => ({
  sparePart: one(spareParts, {
    fields: [sparePartSuppliers.sparePartId],
    references: [spareParts.sparePartId],
  }),
}));

export const equipmentComponentSparePartsRelations = relations(equipmentComponentSpareParts, ({ one }) => ({
  equipment: one(equipment, {
    fields: [equipmentComponentSpareParts.equipmentId],
    references: [equipment.equipmentId],
  }),
  component: one(components, {
    fields: [equipmentComponentSpareParts.componentId],
    references: [components.componentId],
  }),
  sparePart: one(spareParts, {
    fields: [equipmentComponentSpareParts.sparePartId],
    references: [spareParts.sparePartId],
  }),
}));

// Insert schemas
export const insertBaseSchema = createInsertSchema(bases).omit({ baseId: true, createdAt: true, updatedAt: true });
export const insertWorkshopSchema = createInsertSchema(workshops).omit({ workshopId: true, createdAt: true, updatedAt: true });
export const insertEquipmentTypeSchema = createInsertSchema(equipmentTypes).omit({ typeId: true, createdAt: true, updatedAt: true });
export const insertEquipmentSchema = createInsertSchema(equipment).omit({ equipmentId: true, createdAt: true, updatedAt: true });
export const insertComponentSchema = createInsertSchema(components).omit({ componentId: true, createdAt: true, updatedAt: true });
export const insertSparePartSchema = createInsertSchema(spareParts).omit({ sparePartId: true, createdAt: true, updatedAt: true });
export const insertSparePartSupplierSchema = createInsertSchema(sparePartSuppliers).omit({ supplierId: true, createdAt: true, updatedAt: true });
export const insertEquipmentComponentSparePartSchema = createInsertSchema(equipmentComponentSpareParts).omit({ id: true, createdAt: true, updatedAt: true });

// Types
export type Base = typeof bases.$inferSelect;
export type InsertBase = z.infer<typeof insertBaseSchema>;

export type Workshop = typeof workshops.$inferSelect;
export type InsertWorkshop = z.infer<typeof insertWorkshopSchema>;

export type EquipmentType = typeof equipmentTypes.$inferSelect;
export type InsertEquipmentType = z.infer<typeof insertEquipmentTypeSchema>;

export type Equipment = typeof equipment.$inferSelect;
export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;

export type Component = typeof components.$inferSelect;
export type InsertComponent = z.infer<typeof insertComponentSchema>;

export type SparePart = typeof spareParts.$inferSelect;
export type InsertSparePart = z.infer<typeof insertSparePartSchema>;

export type SparePartSupplier = typeof sparePartSuppliers.$inferSelect;
export type InsertSparePartSupplier = z.infer<typeof insertSparePartSupplierSchema>;

export type EquipmentComponentSparePart = typeof equipmentComponentSpareParts.$inferSelect;
export type InsertEquipmentComponentSparePart = z.infer<typeof insertEquipmentComponentSparePartSchema>;

// Extended schemas with additional fields for API responses
export const extendedEquipmentSchema = z.object({
  equipmentId: z.number(),
  workshopId: z.number(),
  typeId: z.number(),
  equipmentName: z.string(),
  workshopName: z.string(),
  typeName: z.string(),
  baseName: z.string(),
  baseId: z.number(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export type ExtendedEquipment = z.infer<typeof extendedEquipmentSchema>;

export const extendedComponentSchema = z.object({
  componentId: z.number(),
  typeId: z.number(),
  componentName: z.string(),
  importanceLevel: z.enum(['A', 'B', 'C']),
  failureRate: z.number().nullable(),
  lifecycleYears: z.number().nullable(),
  typeName: z.string(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export type ExtendedComponent = z.infer<typeof extendedComponentSchema>;

export const extendedSparePartSupplierSchema = z.object({
  supplierId: z.number(),
  sparePartId: z.number(),
  supplierName: z.string(),
  supplyCycleWeeks: z.number(),
  materialCode: z.string(),
  manufacturer: z.string(),
  specification: z.string().nullable(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export type ExtendedSparePartSupplier = z.infer<typeof extendedSparePartSupplierSchema>;

export const extendedAssociationSchema = z.object({
  id: z.number(),
  equipmentId: z.number(),
  componentId: z.number(),
  sparePartId: z.number(),
  quantity: z.number(),
  equipmentName: z.string(),
  componentName: z.string(),
  importanceLevel: z.enum(['A', 'B', 'C']),
  materialCode: z.string(),
  sparePartName: z.string(),
  specification: z.string().nullable(),
  manufacturer: z.string(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export type ExtendedAssociation = z.infer<typeof extendedAssociationSchema>;

// Keep the users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
