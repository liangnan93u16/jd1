import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertSparePartSupplierSchema } from "@shared/schema";
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

// Create a form schema that extends insertSparePartSupplierSchema
const supplierFormSchema = insertSparePartSupplierSchema.extend({
  supplierName: z.string().min(1, "供应商名称不能为空"),
  sparePartId: z.string().min(1, "请选择备件"),
  supplyCycleWeeks: z.string().min(1, "请输入供货周期").transform(val => parseInt(val)),
});

type SupplierFormValues = z.infer<typeof supplierFormSchema>;

interface SupplierFormProps {
  defaultValues?: Partial<SupplierFormValues>;
  supplierId?: number;
  onSuccess?: () => void;
  preselectedSparePartId?: number;
}

export function SupplierForm({
  defaultValues,
  supplierId,
  onSuccess,
  preselectedSparePartId,
}: SupplierFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!supplierId;

  // Fetch the list of spare parts
  const { data: spareParts, isLoading: isLoadingSpareParts } = useQuery({
    queryKey: ["/api/spare-parts"],
  });

  // Prepare default values for the form
  const formDefaults = {
    supplierName: "",
    sparePartId: preselectedSparePartId ? String(preselectedSparePartId) : "",
    supplyCycleWeeks: "",
  };

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: { ...formDefaults, ...defaultValues },
  });

  // Update form values when defaultValues changes
  useEffect(() => {
    if (defaultValues) {
      // Convert values to strings for form fields
      const formattedDefaults = {
        ...defaultValues,
        sparePartId: defaultValues.sparePartId ? String(defaultValues.sparePartId) : "",
        supplyCycleWeeks: defaultValues.supplyCycleWeeks?.toString() || "",
      };
      
      Object.entries(formattedDefaults).forEach(([key, value]) => {
        if (value !== undefined) {
          form.setValue(key as keyof SupplierFormValues, value);
        }
      });
    }
  }, [defaultValues, form]);

  // Set preselected spare part ID if provided
  useEffect(() => {
    if (preselectedSparePartId && !isEditing) {
      form.setValue("sparePartId", String(preselectedSparePartId));
    }
  }, [preselectedSparePartId, form, isEditing]);

  // Handle form submission
  const mutation = useMutation({
    mutationFn: async (values: SupplierFormValues) => {
      // Convert string values to appropriate types for API
      const payload = {
        ...values,
        sparePartId: parseInt(values.sparePartId),
      };
      
      if (isEditing) {
        return apiRequest("PUT", `/api/suppliers/${supplierId}`, payload);
      } else {
        return apiRequest("POST", "/api/suppliers", payload);
      }
    },
    onSuccess: async () => {
      toast({
        title: isEditing ? "供应商更新成功" : "供应商创建成功",
        description: isEditing ? "供应商信息已更新" : "新供应商已添加到系统",
      });
      
      // Invalidate related queries
      await queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
      
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

  const onSubmit = (values: SupplierFormValues) => {
    mutation.mutate(values);
  };

  if (isLoadingSpareParts) {
    return <LoadingSpinner />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="supplierName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>供应商名称</FormLabel>
              <FormControl>
                <Input placeholder="请输入供应商名称" {...field} />
              </FormControl>
              <FormDescription>
                请输入供应商的完整名称
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
              <FormLabel>关联备件</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={!!preselectedSparePartId}
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
                请选择该供应商提供的备件
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="supplyCycleWeeks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>供货周期（周）</FormLabel>
              <FormControl>
                <Input 
                  placeholder="请输入供货周期" 
                  type="number"
                  min="1"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                从下单到交货的平均周期（以周为单位）
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
