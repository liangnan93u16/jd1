import { 
  User, InsertUser, users,
  Base, InsertBase, bases,
  Workshop, InsertWorkshop, workshops,
  EquipmentType, InsertEquipmentType, equipmentTypes,
  Equipment, InsertEquipment, equipment,
  Component, InsertComponent, components,
  SparePart, InsertSparePart, spareParts,
  SparePartSupplier, InsertSparePartSupplier, sparePartSuppliers,
  EquipmentComponentSparePart, InsertEquipmentComponentSparePart, equipmentComponentSpareParts
} from "@shared/schema";
import { db } from "./db";
import { eq, and, like, desc, asc, inArray, or, sql as sqlQuery } from "drizzle-orm";

// Interfaces for CRUD operations
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Base
  getBases(): Promise<Base[]>;
  getBase(id: number): Promise<Base | undefined>;
  createBase(base: InsertBase): Promise<Base>;
  updateBase(id: number, base: InsertBase): Promise<Base | undefined>;
  deleteBase(id: number): Promise<boolean>;

  // Workshop
  getWorkshops(baseId?: number): Promise<Workshop[]>;
  getWorkshop(id: number): Promise<Workshop | undefined>;
  createWorkshop(workshop: InsertWorkshop): Promise<Workshop>;
  updateWorkshop(id: number, workshop: InsertWorkshop): Promise<Workshop | undefined>;
  deleteWorkshop(id: number): Promise<boolean>;

  // Equipment Type
  getEquipmentTypes(): Promise<EquipmentType[]>;
  getEquipmentType(id: number): Promise<EquipmentType | undefined>;
  createEquipmentType(equipmentType: InsertEquipmentType): Promise<EquipmentType>;
  updateEquipmentType(id: number, equipmentType: InsertEquipmentType): Promise<EquipmentType | undefined>;
  deleteEquipmentType(id: number): Promise<boolean>;

  // Equipment
  getEquipments(params?: {
    workshopId?: number;
    typeId?: number;
    baseId?: number;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: any[]; total: number }>;
  getEquipment(id: number): Promise<Equipment | undefined>;
  createEquipment(equipment: InsertEquipment): Promise<Equipment>;
  updateEquipment(id: number, equipment: InsertEquipment): Promise<Equipment | undefined>;
  deleteEquipment(id: number): Promise<boolean>;

  // Component
  getComponents(typeId?: number): Promise<Component[]>;
  getComponent(id: number): Promise<Component | undefined>;
  createComponent(component: InsertComponent): Promise<Component>;
  updateComponent(id: number, component: InsertComponent): Promise<Component | undefined>;
  deleteComponent(id: number): Promise<boolean>;

  // Spare Part
  getSpareParts(search?: string, isCustom?: boolean): Promise<SparePart[]>;
  getSparePart(id: number): Promise<SparePart | undefined>;
  getSparePartByMaterialCode(materialCode: string): Promise<SparePart | undefined>;
  createSparePart(sparePart: InsertSparePart): Promise<SparePart>;
  updateSparePart(id: number, sparePart: InsertSparePart): Promise<SparePart | undefined>;
  deleteSparePart(id: number): Promise<boolean>;

  // Spare Part Supplier
  getSparePartSuppliers(sparePartId?: number): Promise<SparePartSupplier[]>;
  getSparePartSupplier(id: number): Promise<SparePartSupplier | undefined>;
  createSparePartSupplier(supplier: InsertSparePartSupplier): Promise<SparePartSupplier>;
  updateSparePartSupplier(id: number, supplier: InsertSparePartSupplier): Promise<SparePartSupplier | undefined>;
  deleteSparePartSupplier(id: number): Promise<boolean>;

  // Equipment Component Spare Part Association
  getAssociations(params?: {
    equipmentId?: number;
    componentId?: number;
    sparePartId?: number;
    importanceLevel?: string[];
    supplyCycleRange?: [number, number];
    isCustom?: boolean;
    keyword?: string;
  }): Promise<any[]>;
  getAssociation(id: number): Promise<EquipmentComponentSparePart | undefined>;
  createAssociation(association: InsertEquipmentComponentSparePart): Promise<EquipmentComponentSparePart>;
  updateAssociation(id: number, association: InsertEquipmentComponentSparePart): Promise<EquipmentComponentSparePart | undefined>;
  deleteAssociation(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Base methods
  async getBases(): Promise<Base[]> {
    return await db.select().from(bases).orderBy(bases.baseName);
  }

  async getBase(id: number): Promise<Base | undefined> {
    const [base] = await db.select().from(bases).where(eq(bases.baseId, id));
    return base;
  }

  async createBase(base: InsertBase): Promise<Base> {
    const [newBase] = await db.insert(bases).values(base).returning();
    return newBase;
  }

  async updateBase(id: number, base: InsertBase): Promise<Base | undefined> {
    const [updatedBase] = await db
      .update(bases)
      .set(base)
      .where(eq(bases.baseId, id))
      .returning();
    return updatedBase;
  }

  async deleteBase(id: number): Promise<boolean> {
    const result = await db.delete(bases).where(eq(bases.baseId, id));
    return !!result;
  }

  // Workshop methods
  async getWorkshops(baseId?: number): Promise<Workshop[]> {
    let query = db.select().from(workshops);
    
    if (baseId) {
      query = query.where(eq(workshops.baseId, baseId));
    }
    
    return await query.orderBy(workshops.workshopName);
  }

  async getWorkshop(id: number): Promise<Workshop | undefined> {
    const [workshop] = await db.select().from(workshops).where(eq(workshops.workshopId, id));
    return workshop;
  }

  async createWorkshop(workshop: InsertWorkshop): Promise<Workshop> {
    const [newWorkshop] = await db.insert(workshops).values(workshop).returning();
    return newWorkshop;
  }

  async updateWorkshop(id: number, workshop: InsertWorkshop): Promise<Workshop | undefined> {
    const [updatedWorkshop] = await db
      .update(workshops)
      .set(workshop)
      .where(eq(workshops.workshopId, id))
      .returning();
    return updatedWorkshop;
  }

  async deleteWorkshop(id: number): Promise<boolean> {
    const result = await db.delete(workshops).where(eq(workshops.workshopId, id));
    return !!result;
  }

  // Equipment Type methods
  async getEquipmentTypes(): Promise<EquipmentType[]> {
    return await db.select().from(equipmentTypes).orderBy(equipmentTypes.typeName);
  }

  async getEquipmentType(id: number): Promise<EquipmentType | undefined> {
    const [equipmentType] = await db.select().from(equipmentTypes).where(eq(equipmentTypes.typeId, id));
    return equipmentType;
  }

  async createEquipmentType(equipmentType: InsertEquipmentType): Promise<EquipmentType> {
    const [newEquipmentType] = await db.insert(equipmentTypes).values(equipmentType).returning();
    return newEquipmentType;
  }

  async updateEquipmentType(id: number, equipmentType: InsertEquipmentType): Promise<EquipmentType | undefined> {
    const [updatedEquipmentType] = await db
      .update(equipmentTypes)
      .set(equipmentType)
      .where(eq(equipmentTypes.typeId, id))
      .returning();
    return updatedEquipmentType;
  }

  async deleteEquipmentType(id: number): Promise<boolean> {
    const result = await db.delete(equipmentTypes).where(eq(equipmentTypes.typeId, id));
    return !!result;
  }

  // Equipment methods
  async getEquipments(params: {
    workshopId?: number;
    typeId?: number;
    baseId?: number;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{ data: any[]; total: number }> {
    const { 
      workshopId, 
      typeId, 
      baseId, 
      search, 
      page = 1, 
      limit = 10, 
      sortBy = 'equipment_id', 
      sortOrder = 'asc' 
    } = params;
    
    // First, build the query conditions
    const conditions = [];
    
    if (workshopId) {
      conditions.push(eq(equipment.workshopId, workshopId));
    }
    
    if (typeId) {
      conditions.push(eq(equipment.typeId, typeId));
    }
    
    if (search) {
      conditions.push(like(equipment.equipmentName, `%${search}%`));
    }
    
    // Join workshops and equipment_types to get related data
    const query = db.select({
      equipmentId: equipment.equipmentId,
      workshopId: equipment.workshopId,
      typeId: equipment.typeId,
      equipmentName: equipment.equipmentName,
      createdAt: equipment.createdAt,
      updatedAt: equipment.updatedAt,
      workshopName: workshops.workshopName,
      typeName: equipmentTypes.typeName,
      baseId: workshops.baseId,
      baseName: bases.baseName,
    })
    .from(equipment)
    .innerJoin(workshops, eq(equipment.workshopId, workshops.workshopId))
    .innerJoin(equipmentTypes, eq(equipment.typeId, equipmentTypes.typeId))
    .innerJoin(bases, eq(workshops.baseId, bases.baseId));
    
    if (baseId) {
      conditions.push(eq(workshops.baseId, baseId));
    }
    
    // Apply all conditions
    let filteredQuery = conditions.length > 0 
      ? query.where(and(...conditions))
      : query;
    
    // Count total records for pagination
    const countResult = await db.select({
      count: sqlQuery`count(*)`
    })
    .from(equipment)
    .innerJoin(workshops, eq(equipment.workshopId, workshops.workshopId))
    .innerJoin(equipmentTypes, eq(equipment.typeId, equipmentTypes.typeId))
    .innerJoin(bases, eq(workshops.baseId, bases.baseId))
    .where(conditions.length > 0 ? and(...conditions) : undefined);
    
    const total = Number(countResult[0]?.count || 0);
    
    // Apply sorting
    if (sortBy && sortOrder) {
      const orderField = sortBy;
      
      if (sortOrder === 'asc') {
        if (orderField === 'equipmentId') filteredQuery = filteredQuery.orderBy(asc(equipment.equipmentId));
        else if (orderField === 'equipmentName') filteredQuery = filteredQuery.orderBy(asc(equipment.equipmentName));
        else if (orderField === 'workshopName') filteredQuery = filteredQuery.orderBy(asc(workshops.workshopName));
        else if (orderField === 'typeName') filteredQuery = filteredQuery.orderBy(asc(equipmentTypes.typeName));
        else if (orderField === 'baseName') filteredQuery = filteredQuery.orderBy(asc(bases.baseName));
        else if (orderField === 'createdAt') filteredQuery = filteredQuery.orderBy(asc(equipment.createdAt));
      } else {
        if (orderField === 'equipmentId') filteredQuery = filteredQuery.orderBy(desc(equipment.equipmentId));
        else if (orderField === 'equipmentName') filteredQuery = filteredQuery.orderBy(desc(equipment.equipmentName));
        else if (orderField === 'workshopName') filteredQuery = filteredQuery.orderBy(desc(workshops.workshopName));
        else if (orderField === 'typeName') filteredQuery = filteredQuery.orderBy(desc(equipmentTypes.typeName));
        else if (orderField === 'baseName') filteredQuery = filteredQuery.orderBy(desc(bases.baseName));
        else if (orderField === 'createdAt') filteredQuery = filteredQuery.orderBy(desc(equipment.createdAt));
      }
    }
    
    // Apply pagination
    const offset = (page - 1) * limit;
    const data = await filteredQuery.limit(limit).offset(offset);
    
    return { data, total };
  }

  async getEquipment(id: number): Promise<Equipment | undefined> {
    const [equip] = await db.select().from(equipment).where(eq(equipment.equipmentId, id));
    return equip;
  }

  async createEquipment(equipmentData: InsertEquipment): Promise<Equipment> {
    const [newEquipment] = await db.insert(equipment).values(equipmentData).returning();
    return newEquipment;
  }

  async updateEquipment(id: number, equipmentData: InsertEquipment): Promise<Equipment | undefined> {
    const [updatedEquipment] = await db
      .update(equipment)
      .set(equipmentData)
      .where(eq(equipment.equipmentId, id))
      .returning();
    return updatedEquipment;
  }

  async deleteEquipment(id: number): Promise<boolean> {
    const result = await db.delete(equipment).where(eq(equipment.equipmentId, id));
    return !!result;
  }

  // Component methods
  async getComponents(typeId?: number): Promise<Component[]> {
    let query = db.select({
      componentId: components.componentId,
      typeId: components.typeId,
      componentName: components.componentName,
      importanceLevel: components.importanceLevel,
      failureRate: components.failureRate,
      lifecycleYears: components.lifecycleYears,
      createdAt: components.createdAt,
      updatedAt: components.updatedAt,
      typeName: equipmentTypes.typeName,
    })
    .from(components)
    .innerJoin(equipmentTypes, eq(components.typeId, equipmentTypes.typeId));
    
    if (typeId) {
      query = query.where(eq(components.typeId, typeId));
    }
    
    return await query.orderBy(components.componentName);
  }

  async getComponent(id: number): Promise<Component | undefined> {
    const [component] = await db.select().from(components).where(eq(components.componentId, id));
    return component;
  }

  async createComponent(component: InsertComponent): Promise<Component> {
    const [newComponent] = await db.insert(components).values(component).returning();
    return newComponent;
  }

  async updateComponent(id: number, component: InsertComponent): Promise<Component | undefined> {
    const [updatedComponent] = await db
      .update(components)
      .set(component)
      .where(eq(components.componentId, id))
      .returning();
    return updatedComponent;
  }

  async deleteComponent(id: number): Promise<boolean> {
    const result = await db.delete(components).where(eq(components.componentId, id));
    return !!result;
  }

  // Spare Part methods
  async getSpareParts(search?: string, isCustom?: boolean): Promise<SparePart[]> {
    let query = db.select().from(spareParts);
    
    const conditions = [];
    
    if (search) {
      conditions.push(
        or(
          like(spareParts.materialCode, `%${search}%`),
          like(spareParts.manufacturer, `%${search}%`),
          like(spareParts.specification, `%${search}%`),
          like(spareParts.description, `%${search}%`)
        )
      );
    }
    
    if (isCustom !== undefined) {
      conditions.push(eq(spareParts.isCustom, isCustom));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(spareParts.materialCode);
  }

  async getSparePart(id: number): Promise<SparePart | undefined> {
    const [sparePart] = await db.select().from(spareParts).where(eq(spareParts.sparePartId, id));
    return sparePart;
  }

  async getSparePartByMaterialCode(materialCode: string): Promise<SparePart | undefined> {
    const [sparePart] = await db.select().from(spareParts).where(eq(spareParts.materialCode, materialCode));
    return sparePart;
  }

  async createSparePart(sparePart: InsertSparePart): Promise<SparePart> {
    const [newSparePart] = await db.insert(spareParts).values(sparePart).returning();
    return newSparePart;
  }

  async updateSparePart(id: number, sparePart: InsertSparePart): Promise<SparePart | undefined> {
    const [updatedSparePart] = await db
      .update(spareParts)
      .set(sparePart)
      .where(eq(spareParts.sparePartId, id))
      .returning();
    return updatedSparePart;
  }

  async deleteSparePart(id: number): Promise<boolean> {
    const result = await db.delete(spareParts).where(eq(spareParts.sparePartId, id));
    return !!result;
  }

  // Spare Part Supplier methods
  async getSparePartSuppliers(sparePartId?: number): Promise<SparePartSupplier[]> {
    let query = db.select({
      supplierId: sparePartSuppliers.supplierId,
      sparePartId: sparePartSuppliers.sparePartId,
      supplierName: sparePartSuppliers.supplierName,
      supplyCycleWeeks: sparePartSuppliers.supplyCycleWeeks,
      createdAt: sparePartSuppliers.createdAt,
      updatedAt: sparePartSuppliers.updatedAt,
      materialCode: spareParts.materialCode,
      manufacturer: spareParts.manufacturer,
      specification: spareParts.specification,
    })
    .from(sparePartSuppliers)
    .innerJoin(spareParts, eq(sparePartSuppliers.sparePartId, spareParts.sparePartId));
    
    if (sparePartId) {
      query = query.where(eq(sparePartSuppliers.sparePartId, sparePartId));
    }
    
    return await query.orderBy(sparePartSuppliers.supplierName);
  }

  async getSparePartSupplier(id: number): Promise<SparePartSupplier | undefined> {
    const [supplier] = await db.select().from(sparePartSuppliers).where(eq(sparePartSuppliers.supplierId, id));
    return supplier;
  }

  async createSparePartSupplier(supplier: InsertSparePartSupplier): Promise<SparePartSupplier> {
    const [newSupplier] = await db.insert(sparePartSuppliers).values(supplier).returning();
    return newSupplier;
  }

  async updateSparePartSupplier(id: number, supplier: InsertSparePartSupplier): Promise<SparePartSupplier | undefined> {
    const [updatedSupplier] = await db
      .update(sparePartSuppliers)
      .set(supplier)
      .where(eq(sparePartSuppliers.supplierId, id))
      .returning();
    return updatedSupplier;
  }

  async deleteSparePartSupplier(id: number): Promise<boolean> {
    const result = await db.delete(sparePartSuppliers).where(eq(sparePartSuppliers.supplierId, id));
    return !!result;
  }

  // Equipment Component Spare Part Association methods
  async getAssociations(params: {
    equipmentId?: number;
    componentId?: number;
    sparePartId?: number;
    importanceLevel?: string[];
    supplyCycleRange?: [number, number];
    isCustom?: boolean;
    keyword?: string;
  } = {}): Promise<any[]> {
    const { 
      equipmentId, 
      componentId, 
      sparePartId, 
      importanceLevel, 
      supplyCycleRange, 
      isCustom, 
      keyword 
    } = params;
    
    // Start building the query with all necessary joins
    let query = db.select({
      id: equipmentComponentSpareParts.id,
      equipmentId: equipmentComponentSpareParts.equipmentId,
      componentId: equipmentComponentSpareParts.componentId,
      sparePartId: equipmentComponentSpareParts.sparePartId,
      quantity: equipmentComponentSpareParts.quantity,
      createdAt: equipmentComponentSpareParts.createdAt,
      updatedAt: equipmentComponentSpareParts.updatedAt,
      equipmentName: equipment.equipmentName,
      componentName: components.componentName,
      importanceLevel: components.importanceLevel,
      materialCode: spareParts.materialCode,
      sparePartName: spareParts.description,
      specification: spareParts.specification,
      manufacturer: spareParts.manufacturer,
    })
    .from(equipmentComponentSpareParts)
    .innerJoin(equipment, eq(equipmentComponentSpareParts.equipmentId, equipment.equipmentId))
    .innerJoin(components, eq(equipmentComponentSpareParts.componentId, components.componentId))
    .innerJoin(spareParts, eq(equipmentComponentSpareParts.sparePartId, spareParts.sparePartId))
    .leftJoin(sparePartSuppliers, eq(spareParts.sparePartId, sparePartSuppliers.sparePartId));
    
    // Build the conditions array
    const conditions = [];
    
    if (equipmentId) {
      conditions.push(eq(equipmentComponentSpareParts.equipmentId, equipmentId));
    }
    
    if (componentId) {
      conditions.push(eq(equipmentComponentSpareParts.componentId, componentId));
    }
    
    if (sparePartId) {
      conditions.push(eq(equipmentComponentSpareParts.sparePartId, sparePartId));
    }
    
    if (importanceLevel && importanceLevel.length > 0) {
      conditions.push(inArray(components.importanceLevel, importanceLevel as any[]));
    }
    
    if (supplyCycleRange && supplyCycleRange.length === 2) {
      const [min, max] = supplyCycleRange;
      if (min !== undefined && max !== undefined) {
        conditions.push(
          and(
            sqlQuery`${sparePartSuppliers.supplyCycleWeeks} >= ${min}`,
            sqlQuery`${sparePartSuppliers.supplyCycleWeeks} <= ${max}`
          )
        );
      }
    }
    
    if (isCustom !== undefined) {
      conditions.push(eq(spareParts.isCustom, isCustom));
    }
    
    if (keyword) {
      conditions.push(
        or(
          like(spareParts.materialCode, `%${keyword}%`),
          like(spareParts.description, `%${keyword}%`),
          like(spareParts.specification, `%${keyword}%`),
          like(equipment.equipmentName, `%${keyword}%`),
          like(components.componentName, `%${keyword}%`)
        )
      );
    }
    
    // Apply conditions to the query
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    // Execute the query and return results
    return await query.orderBy(equipment.equipmentName, components.componentName);
  }

  async getAssociation(id: number): Promise<EquipmentComponentSparePart | undefined> {
    const [association] = await db
      .select()
      .from(equipmentComponentSpareParts)
      .where(eq(equipmentComponentSpareParts.id, id));
    return association;
  }

  async createAssociation(association: InsertEquipmentComponentSparePart): Promise<EquipmentComponentSparePart> {
    const [newAssociation] = await db
      .insert(equipmentComponentSpareParts)
      .values(association)
      .returning();
    return newAssociation;
  }

  async updateAssociation(id: number, association: InsertEquipmentComponentSparePart): Promise<EquipmentComponentSparePart | undefined> {
    const [updatedAssociation] = await db
      .update(equipmentComponentSpareParts)
      .set(association)
      .where(eq(equipmentComponentSpareParts.id, id))
      .returning();
    return updatedAssociation;
  }

  async deleteAssociation(id: number): Promise<boolean> {
    const result = await db.delete(equipmentComponentSpareParts).where(eq(equipmentComponentSpareParts.id, id));
    return !!result;
  }
}

export const storage = new DatabaseStorage();
