import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import {
  insertBaseSchema,
  insertWorkshopSchema,
  insertEquipmentTypeSchema,
  insertEquipmentSchema,
  insertComponentSchema,
  insertSparePartSchema,
  insertSparePartSupplierSchema,
  insertEquipmentComponentSparePartSchema,
  SparePart,
  EquipmentComponentSparePart
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Error handling middleware
  const handleErrors = (err: Error, res: Response) => {
    console.error("API Error:", err);
    
    if (err instanceof ZodError) {
      const validationError = fromZodError(err);
      return res.status(400).json({ 
        error: "Validation error", 
        details: validationError.message 
      });
    }
    
    res.status(500).json({ 
      error: "Internal server error", 
      message: err.message 
    });
  };

  // Base routes
  app.get("/api/bases", async (_req, res) => {
    try {
      const bases = await storage.getBases();
      res.json(bases);
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });

  app.get("/api/bases/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const base = await storage.getBase(id);
      
      if (!base) {
        return res.status(404).json({ error: "Base not found" });
      }
      
      res.json(base);
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });

  app.post("/api/bases", async (req, res) => {
    try {
      const baseData = insertBaseSchema.parse(req.body);
      const newBase = await storage.createBase(baseData);
      res.status(201).json(newBase);
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });

  app.put("/api/bases/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const baseData = insertBaseSchema.parse(req.body);
      const updatedBase = await storage.updateBase(id, baseData);
      
      if (!updatedBase) {
        return res.status(404).json({ error: "Base not found" });
      }
      
      res.json(updatedBase);
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });

  app.delete("/api/bases/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.deleteBase(id);
      
      if (!result) {
        return res.status(404).json({ error: "Base not found or could not be deleted" });
      }
      
      res.json({ success: true });
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });

  // Workshop routes
  app.get("/api/workshops", async (req, res) => {
    try {
      const baseId = req.query.baseId ? parseInt(req.query.baseId as string) : undefined;
      const workshops = await storage.getWorkshops(baseId);
      res.json(workshops);
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });

  app.get("/api/workshops/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const workshop = await storage.getWorkshop(id);
      
      if (!workshop) {
        return res.status(404).json({ error: "Workshop not found" });
      }
      
      res.json(workshop);
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });

  app.post("/api/workshops", async (req, res) => {
    try {
      const workshopData = insertWorkshopSchema.parse(req.body);
      const newWorkshop = await storage.createWorkshop(workshopData);
      res.status(201).json(newWorkshop);
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });

  app.put("/api/workshops/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const workshopData = insertWorkshopSchema.parse(req.body);
      const updatedWorkshop = await storage.updateWorkshop(id, workshopData);
      
      if (!updatedWorkshop) {
        return res.status(404).json({ error: "Workshop not found" });
      }
      
      res.json(updatedWorkshop);
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });

  app.delete("/api/workshops/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.deleteWorkshop(id);
      
      if (!result) {
        return res.status(404).json({ error: "Workshop not found or could not be deleted" });
      }
      
      res.json({ success: true });
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });

  // Equipment Type routes
  app.get("/api/equipment-types", async (_req, res) => {
    try {
      const types = await storage.getEquipmentTypes();
      res.json(types);
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });

  app.get("/api/equipment-types/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const type = await storage.getEquipmentType(id);
      
      if (!type) {
        return res.status(404).json({ error: "Equipment type not found" });
      }
      
      res.json(type);
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });

  app.post("/api/equipment-types", async (req, res) => {
    try {
      const typeData = insertEquipmentTypeSchema.parse(req.body);
      const newType = await storage.createEquipmentType(typeData);
      res.status(201).json(newType);
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });

  app.put("/api/equipment-types/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const typeData = insertEquipmentTypeSchema.parse(req.body);
      const updatedType = await storage.updateEquipmentType(id, typeData);
      
      if (!updatedType) {
        return res.status(404).json({ error: "Equipment type not found" });
      }
      
      res.json(updatedType);
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });

  app.delete("/api/equipment-types/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.deleteEquipmentType(id);
      
      if (!result) {
        return res.status(404).json({ error: "Equipment type not found or could not be deleted" });
      }
      
      res.json({ success: true });
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });

  // Equipment routes
  app.get("/api/equipment", async (req: Request, res: Response) => {
    try {
      const params = {
        workshopId: req.query.workshopId ? parseInt(req.query.workshopId as string) : undefined,
        typeId: req.query.typeId ? parseInt(req.query.typeId as string) : undefined,
        baseId: req.query.baseId ? parseInt(req.query.baseId as string) : undefined,
        search: req.query.search as string | undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        sortBy: req.query.sortBy as string | undefined,
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc',
      };
      
      const { data, total } = await storage.getEquipments(params);
      
      res.json({
        data,
        pagination: {
          page: params.page,
          limit: params.limit,
          total,
          totalPages: Math.ceil(total / params.limit),
        }
      });
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });

  app.get("/api/equipment/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const equipment = await storage.getEquipment(id);
      
      if (!equipment) {
        return res.status(404).json({ error: "Equipment not found" });
      }
      
      res.json(equipment);
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });

  app.post("/api/equipment", async (req, res) => {
    try {
      const equipmentData = insertEquipmentSchema.parse(req.body);
      const newEquipment = await storage.createEquipment(equipmentData);
      res.status(201).json(newEquipment);
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });

  app.put("/api/equipment/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const equipmentData = insertEquipmentSchema.parse(req.body);
      const updatedEquipment = await storage.updateEquipment(id, equipmentData);
      
      if (!updatedEquipment) {
        return res.status(404).json({ error: "Equipment not found" });
      }
      
      res.json(updatedEquipment);
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });

  app.delete("/api/equipment/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.deleteEquipment(id);
      
      if (!result) {
        return res.status(404).json({ error: "Equipment not found or could not be deleted" });
      }
      
      res.json({ success: true });
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });

  // Component routes
  app.get("/api/components", async (req, res) => {
    try {
      const typeId = req.query.typeId ? parseInt(req.query.typeId as string) : undefined;
      const components = await storage.getComponents(typeId);
      res.json(components);
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });

  app.get("/api/components/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const component = await storage.getComponent(id);
      
      if (!component) {
        return res.status(404).json({ error: "Component not found" });
      }
      
      res.json(component);
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });

  app.post("/api/components", async (req, res) => {
    try {
      const componentData = insertComponentSchema.parse(req.body);
      const newComponent = await storage.createComponent(componentData);
      res.status(201).json(newComponent);
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });

  app.put("/api/components/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const componentData = insertComponentSchema.parse(req.body);
      const updatedComponent = await storage.updateComponent(id, componentData);
      
      if (!updatedComponent) {
        return res.status(404).json({ error: "Component not found" });
      }
      
      res.json(updatedComponent);
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });

  app.delete("/api/components/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.deleteComponent(id);
      
      if (!result) {
        return res.status(404).json({ error: "Component not found or could not be deleted" });
      }
      
      res.json({ success: true });
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });

  // Spare Part routes
  app.get("/api/spare-parts", async (req, res) => {
    try {
      const search = req.query.search as string | undefined;
      const isCustom = req.query.isCustom !== undefined ? 
        req.query.isCustom === 'true' : undefined;
      
      const spareParts = await storage.getSpareParts(search, isCustom);
      res.json(spareParts);
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });

  app.get("/api/spare-parts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const sparePart = await storage.getSparePart(id);
      
      if (!sparePart) {
        return res.status(404).json({ error: "Spare part not found" });
      }
      
      res.json(sparePart);
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });

  app.post("/api/spare-parts", async (req, res) => {
    try {
      const sparePartData = insertSparePartSchema.parse(req.body);
      
      // Check if material code already exists
      const existing = await storage.getSparePartByMaterialCode(sparePartData.materialCode);
      if (existing) {
        return res.status(400).json({ error: "Material code already exists" });
      }
      
      const newSparePart = await storage.createSparePart(sparePartData);
      res.status(201).json(newSparePart);
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });

  app.put("/api/spare-parts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const sparePartData = insertSparePartSchema.parse(req.body);
      
      // Check if material code already exists for a different spare part
      const existing = await storage.getSparePartByMaterialCode(sparePartData.materialCode);
      if (existing && existing.sparePartId !== id) {
        return res.status(400).json({ error: "Material code already exists" });
      }
      
      const updatedSparePart = await storage.updateSparePart(id, sparePartData);
      
      if (!updatedSparePart) {
        return res.status(404).json({ error: "Spare part not found" });
      }
      
      res.json(updatedSparePart);
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });

  app.delete("/api/spare-parts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.deleteSparePart(id);
      
      if (!result) {
        return res.status(404).json({ error: "Spare part not found or could not be deleted" });
      }
      
      res.json({ success: true });
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });

  // Spare Part Supplier routes
  app.get("/api/suppliers", async (req, res) => {
    try {
      const sparePartId = req.query.sparePartId ? parseInt(req.query.sparePartId as string) : undefined;
      const suppliers = await storage.getSparePartSuppliers(sparePartId);
      res.json(suppliers);
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });

  app.get("/api/suppliers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const supplier = await storage.getSparePartSupplier(id);
      
      if (!supplier) {
        return res.status(404).json({ error: "Supplier not found" });
      }
      
      res.json(supplier);
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });

  app.post("/api/suppliers", async (req, res) => {
    try {
      const supplierData = insertSparePartSupplierSchema.parse(req.body);
      const newSupplier = await storage.createSparePartSupplier(supplierData);
      res.status(201).json(newSupplier);
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });

  app.put("/api/suppliers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const supplierData = insertSparePartSupplierSchema.parse(req.body);
      const updatedSupplier = await storage.updateSparePartSupplier(id, supplierData);
      
      if (!updatedSupplier) {
        return res.status(404).json({ error: "Supplier not found" });
      }
      
      res.json(updatedSupplier);
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });

  app.delete("/api/suppliers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.deleteSparePartSupplier(id);
      
      if (!result) {
        return res.status(404).json({ error: "Supplier not found or could not be deleted" });
      }
      
      res.json({ success: true });
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });

  // Equipment Component Spare Part Association routes
  app.get("/api/associations", async (req, res) => {
    try {
      const params = {
        equipmentId: req.query.equipmentId && req.query.equipmentId !== 'all' ? 
          parseInt(req.query.equipmentId as string) : undefined,
        componentId: req.query.componentId && req.query.componentId !== 'all' ? 
          parseInt(req.query.componentId as string) : undefined,
        sparePartId: req.query.sparePartId && req.query.sparePartId !== 'all' ? 
          parseInt(req.query.sparePartId as string) : undefined,
        importanceLevel: req.query.importanceLevel ? (req.query.importanceLevel as string).split(',') : undefined,
        supplyCycleRange: req.query.supplyCycleRange ? 
          (req.query.supplyCycleRange as string).split(',').map(Number) as [number, number] : 
          undefined,
        isCustom: req.query.isCustom !== undefined ? 
          req.query.isCustom === 'true' : undefined,
        keyword: req.query.keyword as string | undefined,
      };
      
      const associations = await storage.getAssociations(params);
      res.json(associations);
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });

  app.get("/api/associations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const association = await storage.getAssociation(id);
      
      if (!association) {
        return res.status(404).json({ error: "Association not found" });
      }
      
      res.json(association);
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });

  app.post("/api/associations", async (req, res) => {
    try {
      const associationData = insertEquipmentComponentSparePartSchema.parse(req.body);
      const newAssociation = await storage.createAssociation(associationData);
      res.status(201).json(newAssociation);
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });

  app.put("/api/associations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const associationData = insertEquipmentComponentSparePartSchema.parse(req.body);
      const updatedAssociation = await storage.updateAssociation(id, associationData);
      
      if (!updatedAssociation) {
        return res.status(404).json({ error: "Association not found" });
      }
      
      res.json(updatedAssociation);
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });

  app.delete("/api/associations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.deleteAssociation(id);
      
      if (!result) {
        return res.status(404).json({ error: "Association not found or could not be deleted" });
      }
      
      res.json({ success: true });
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });

  // Hierarchy APIs for tree views
  
  // API to get base hierarchy (base > workshops > equipment)
  app.get("/api/hierarchy/base/:id", async (req, res) => {
    try {
      const baseId = parseInt(req.params.id);
      const base = await storage.getBase(baseId);
      
      if (!base) {
        return res.status(404).json({ error: "Base not found" });
      }
      
      // Get all workshops for this base
      const workshops = await storage.getWorkshops(baseId);
      
      // Build hierarchy
      const hierarchy = {
        id: base.baseId,
        name: base.baseName,
        type: "基地",
        data: base,
        children: await Promise.all(workshops.map(async (workshop) => {
          // Get equipment for each workshop
          const equipmentResponse = await storage.getEquipments({ 
            workshopId: workshop.workshopId,
            limit: 100, // Large enough for all equipment
          });
          
          return {
            id: workshop.workshopId,
            name: workshop.workshopName,
            type: "车间",
            data: workshop,
            children: equipmentResponse.data.map(equipment => ({
              id: equipment.equipmentId,
              name: equipment.equipmentName,
              type: "设备",
              data: equipment,
            }))
          };
        }))
      };
      
      res.json(hierarchy);
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });
  
  // API to get equipment hierarchy (equipment > components > spare parts)
  app.get("/api/hierarchy/equipment/:id", async (req, res) => {
    try {
      const equipmentId = parseInt(req.params.id);
      const equipment = await storage.getEquipment(equipmentId);
      
      if (!equipment) {
        return res.status(404).json({ error: "Equipment not found" });
      }
      
      // Get all associations for this equipment
      const associations = await storage.getAssociations({ equipmentId });
      
      // Group associations by component
      const componentsMap = new Map();
      
      for (const assoc of associations) {
        if (!componentsMap.has(assoc.componentId)) {
          const component = await storage.getComponent(assoc.componentId);
          if (component) {
            componentsMap.set(assoc.componentId, {
              component,
              spareParts: []
            });
          }
        }
        
        if (componentsMap.has(assoc.componentId)) {
          const sparePart = await storage.getSparePart(assoc.sparePartId);
          if (sparePart) {
            componentsMap.get(assoc.componentId).spareParts.push({
              sparePart,
              association: assoc
            });
          }
        }
      }
      
      // Build hierarchy
      const hierarchy = {
        id: equipment.equipmentId,
        name: equipment.equipmentName,
        type: "设备",
        data: equipment,
        children: Array.from(componentsMap.entries()).map(([componentId, { component, spareParts }]) => ({
          id: componentId,
          name: component.componentName,
          type: "部件",
          data: component,
          children: spareParts.map(({ sparePart, association }: { sparePart: SparePart, association: EquipmentComponentSparePart }) => ({
            id: sparePart.sparePartId,
            name: sparePart.sparePartName,
            type: "备件",
            data: {
              ...sparePart,
              importanceLevel: association.importanceLevel,
              supplyCycle: association.supplyCycle,
              quantity: association.quantity
            }
          }))
        }))
      };
      
      res.json(hierarchy);
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });

  // Base hierarchy endpoint
  app.get("/api/hierarchy/base/:baseId", async (req: Request, res: Response) => {
    try {
      const baseId = parseInt(req.params.baseId);
      if (isNaN(baseId)) {
        return res.status(400).json({ error: "Invalid base ID" });
      }

      // Get base
      const base = await storage.getBase(baseId);
      if (!base) {
        return res.status(404).json({ error: "Base not found" });
      }

      // Get workshops in this base
      const workshops = await storage.getWorkshops(baseId);
      
      // For each workshop, get equipment
      const workshopNodes = await Promise.all(
        workshops.map(async (workshop) => {
          // Get equipment for this workshop
          const equipmentList = await storage.getEquipments({ 
            workshopId: workshop.workshopId,
            limit: 1000  // Set high limit to get all equipment
          });
          
          // Map equipment to tree nodes
          const equipmentNodes = equipmentList.data.map(equipment => ({
            id: `equipment-${equipment.equipmentId}`,
            name: equipment.equipmentName,
            type: "设备",
            data: equipment,
            children: []
          }));
          
          return {
            id: `workshop-${workshop.workshopId}`,
            name: workshop.workshopName,
            type: "车间",
            data: workshop,
            children: equipmentNodes
          };
        })
      );
      
      // Build hierarchy
      const hierarchy = {
        id: `base-${base.baseId}`,
        name: base.baseName,
        type: "基地",
        data: base,
        children: workshopNodes
      };
      
      res.json(hierarchy);
    } catch (err) {
      handleErrors(err as Error, res);
    }
  });

  // Create and return the HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
