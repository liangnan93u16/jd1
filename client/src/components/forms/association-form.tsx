import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertEquipmentComponentSparePartSchema } from "@shared/schema";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/common/loading-spinner";

// Create a form schema that extends insertEquipmentComponentSparePartSchema
const associationFormSchema = insertEquipmentComponentSparePartSchema.extend({
  equipmentId: z.string().min(1, "请选择设备"),
  componentId: z.string().min(1, "请选择部件"),
  sparePartId: z.string().min(1, "请选择备件"),
  quantity: z.string().min(1, "请输入数量").transform(val => parseInt(val)),
});

type AssociationFormValues = z.infer<typeof associationFormSchema>;

interface AssociationFormProps {
  defaultValues?: Partial<AssociationFormValues>;
  associationId?: number;
  onSuccess?: () => void;
}

export function AssociationForm({
  defaultValues,
  associationId,
  onSuccess,
}: AssociationFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!associationId;

  // Fetch the list of equipment
  const { data: equipment, isLoading: isLoadingEquipment } = useQuery({
    queryKey: ["/api/equipment"],
  });

  // Fetch the list of components
  const { data: components, isLoading: isLoadingComponents } = useQuery({
    queryKey: ["/api/components"],
  });

  // Fetch the list of spare parts
  const { data: spareParts, isLoading: isLoadingSpareParts } = useQuery({
    queryKey: ["/api/spare-parts"],
  });

  // Prepare default values for the form
  const formDefaults = {
    equipmentId: "",
    componentId: "",
    sparePartId: "",
    quantity: "1",
  };

  const form = useForm<AssociationFormValues>({
    resolver: zodResolver(associationFormSchema),
    defaultValues: { ...formDefaults, ...defaultValues },
  });

  // Update form values when defaultValues changes
  useEffect(() => {
    if (defaultValues) {
      // Convert values to strings for form fields
      const formattedDefaults = {
        ...defaultValues,
        equipmentId: defaultValues.equipmentId ? String(defaultValues.equipmentId) : "",
        componentId: defaultValues.componentId ? String(defaultValues.componentId) : "",
        sparePartId: defaultValues.sparePartId ? String(defaultValues.sparePartId) : "",
        quantity: defaultValues.quantity?.toString() || "1",
      };
      
      Object.entries(formattedDefaults).forEach(([key, value]) => {
        if (value !== undefined) {
          form.setValue(key as keyof AssociationFormValues, value);
        }
      });
    }
  }, [defaultValues, form]);

  // Handle form submission
  const mutation = useMutation({
    mutationFn: async (values: AssociationFormValues) => {
      // Convert string values to appropriate types for API
      const payload = {
        ...values,
        equipmentId: parseInt(values.equipmentId),
        componentId: parseInt(values.componentId),
        sparePartId: parseInt(values.sparePartId),
      };
      
      if (isEditing) {
        return apiRequest("PUT", `/api/associations/${associationId}`, payload);
      } else {
        return apiRequest("POST", "/api/associations", payload);
      }
    },
    onSuccess: async () => {
      toast({
        title: isEditing ? "关联更新成功" : "关联创建成功",
        description: isEditing ? "关联信息已更新" : "新关联已添加到系统",
      });
      
      // Invalidate related queries
      await queryClient.invalidateQueries({ queryKey: ["/api/associations"] });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      toast({
        title: "操作失败",
        description: (error as Error).message || "发生未知错误",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: AssociationFormValues) => {
    mutation.mutate(values);
  };

  if (isLoadingEquipment || isLoadingComponents || isLoadingSpareParts) {
    return <LoadingSpinner />;
  }

  // Filter components based on selected equipment type
  const selectedEquipmentId = form.watch("equipmentId");
  const selectedEquipment = selectedEquipmentId 
    ? equipment?.data?.find((e: any) => e.equipmentId.toString() === selectedEquipmentId)
    : null;
  
  const filteredComponents = components?.filter((component: any) => 
    !selectedEquipment || component.typeId === selectedEquipment.typeId
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="equipmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>设备</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  // Reset component selection when equipment changes
                  form.setValue("componentId", "");
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择设备" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {equipment?.data?.map((equip: any) => (
                    <SelectItem
                      key={equip.equipmentId}
                      value={equip.equipmentId.toString()}
                    >
                      {equip.equipmentName} - {equip.workshopName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                请选择需要关联的设备
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="componentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>部件</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择部件" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredComponents?.map((component: any) => (
                    <SelectItem
                      key={component.componentId}
                      value={component.componentId.toString()}
                    >
                      {component.componentName} ({component.importanceLevel})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                请选择需要关联的部件
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sparePartId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>备件</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择备件" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {spareParts?.map((part: any) => (
                    <SelectItem
                      key={part.sparePartId}
                      value={part.sparePartId.toString()}
                    >
                      {part.materialCode} - {part.description || part.specification || part.manufacturer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                请选择需要关联的备件
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>数量</FormLabel>
              <FormControl>
                <Input 
                  placeholder="请输入数量" 
                  type="number"
                  min="1"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                需要的备件数量
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button
            type="submit"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "保存中..." : "保存"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
