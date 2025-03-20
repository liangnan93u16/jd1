import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertEquipmentSchema } from "@shared/schema";
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

// Create a form schema that extends insertEquipmentSchema
const equipmentFormSchema = insertEquipmentSchema.extend({
  equipmentName: z.string().min(1, "设备名称不能为空"),
  workshopId: z.string().min(1, "请选择车间"),
  typeId: z.string().min(1, "请选择设备类型"),
});

type EquipmentFormValues = z.infer<typeof equipmentFormSchema>;

interface EquipmentFormProps {
  defaultValues?: Partial<EquipmentFormValues>;
  equipmentId?: number;
  onSuccess?: () => void;
}

export function EquipmentForm({
  defaultValues,
  equipmentId,
  onSuccess,
}: EquipmentFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!equipmentId;

  // Fetch the list of bases for filtering workshops
  const { data: bases, isLoading: isLoadingBases } = useQuery({
    queryKey: ["/api/bases"],
  });

  // Fetch the list of workshops
  const { data: workshops, isLoading: isLoadingWorkshops } = useQuery({
    queryKey: ["/api/workshops"],
  });

  // Fetch the list of equipment types
  const { data: equipmentTypes, isLoading: isLoadingTypes } = useQuery({
    queryKey: ["/api/equipment-types"],
  });

  // Define form with default values
  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: {
      equipmentName: "",
      ...defaultValues,
      // Convert IDs to strings to work with form select components
      workshopId: defaultValues?.workshopId ? String(defaultValues.workshopId) : "",
      typeId: defaultValues?.typeId ? String(defaultValues.typeId) : "",
    },
  });

  // Update form values when defaultValues changes
  useEffect(() => {
    if (defaultValues) {
      // Need to convert number values to strings for select inputs
      const formattedDefaults = {
        ...defaultValues,
        workshopId: defaultValues.workshopId ? String(defaultValues.workshopId) : "",
        typeId: defaultValues.typeId ? String(defaultValues.typeId) : "",
      };
      
      Object.entries(formattedDefaults).forEach(([key, value]) => {
        if (value !== undefined) {
          form.setValue(key as keyof EquipmentFormValues, value);
        }
      });
    }
  }, [defaultValues, form]);

  // Handle form submission
  const mutation = useMutation({
    mutationFn: async (values: EquipmentFormValues) => {
      // Convert string IDs to numbers for API
      const payload = {
        ...values,
        workshopId: parseInt(values.workshopId),
        typeId: parseInt(values.typeId),
      };
      
      if (isEditing) {
        return apiRequest("PUT", `/api/equipment/${equipmentId}`, payload);
      } else {
        return apiRequest("POST", "/api/equipment", payload);
      }
    },
    onSuccess: async () => {
      toast({
        title: isEditing ? "设备更新成功" : "设备创建成功",
        description: isEditing ? "设备信息已更新" : "新设备已添加到系统",
      });
      
      // Invalidate related queries
      await queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
      
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

  const onSubmit = (values: EquipmentFormValues) => {
    mutation.mutate(values);
  };

  if (isLoadingBases || isLoadingWorkshops || isLoadingTypes) {
    return <LoadingSpinner />;
  }

  // Group workshops by base for better organization
  const workshopsByBase = Array.isArray(workshops) 
    ? workshops.reduce((acc: Record<number, any[]>, workshop: any) => {
        const baseId = workshop.baseId;
        if (!acc[baseId]) {
          acc[baseId] = [];
        }
        acc[baseId].push(workshop);
        return acc;
      }, {}) 
    : {};

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="equipmentName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>设备名称</FormLabel>
              <FormControl>
                <Input placeholder="请输入设备名称" {...field} />
              </FormControl>
              <FormDescription>
                请输入设备的完整名称
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="workshopId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>所属车间</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择车间" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Array.isArray(bases) ? bases.map((base: any) => (
                    <React.Fragment key={base.baseId}>
                      {workshopsByBase[base.baseId]?.length > 0 && (
                        <>
                          <div className="px-2 py-1 text-xs font-semibold text-gray-500">
                            {base.baseName}
                          </div>
                          {workshopsByBase[base.baseId].map((workshop: any) => (
                            <SelectItem
                              key={workshop.workshopId}
                              value={workshop.workshopId.toString()}
                            >
                              {workshop.workshopName}
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </React.Fragment>
                  )) : <div className="px-2 py-1 text-xs text-gray-500">无可用数据</div>}
                </SelectContent>
              </Select>
              <FormDescription>
                请选择设备所属的车间
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="typeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>设备类型</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择设备类型" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Array.isArray(equipmentTypes) ? equipmentTypes.map((type: any) => (
                    <SelectItem
                      key={type.typeId}
                      value={type.typeId.toString()}
                    >
                      {type.typeName}
                    </SelectItem>
                  )) : <div className="px-2 py-1 text-xs text-gray-500">无可用数据</div>}
                </SelectContent>
              </Select>
              <FormDescription>
                请选择设备的类型
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
