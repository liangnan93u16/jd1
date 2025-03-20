import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertComponentSchema } from "@shared/schema";
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

// Create a form schema that extends insertComponentSchema
const componentFormSchema = insertComponentSchema.extend({
  componentName: z.string().min(1, "部件名称不能为空"),
  typeId: z.string().min(1, "请选择设备类型"),
  importanceLevel: z.enum(["A", "B", "C"]),
  failureRate: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  lifecycleYears: z.string().optional().transform(val => val ? parseInt(val) : undefined),
});

type ComponentFormValues = z.infer<typeof componentFormSchema>;

interface ComponentFormProps {
  defaultValues?: Partial<ComponentFormValues>;
  componentId?: number;
  onSuccess?: () => void;
}

export function ComponentForm({
  defaultValues,
  componentId,
  onSuccess,
}: ComponentFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!componentId;

  // Fetch the list of equipment types
  const { data: equipmentTypes, isLoading: isLoadingTypes } = useQuery({
    queryKey: ["/api/equipment-types"],
  });

  // Prepare default values for the form
  const formDefaults = {
    componentName: "",
    typeId: "",
    importanceLevel: "A" as const,
    failureRate: "",
    lifecycleYears: "",
  };

  const form = useForm<ComponentFormValues>({
    resolver: zodResolver(componentFormSchema),
    defaultValues: { ...formDefaults, ...defaultValues },
  });

  // Update form values when defaultValues changes
  useEffect(() => {
    if (defaultValues) {
      // Convert values to strings for form fields
      const formattedDefaults = {
        ...defaultValues,
        typeId: defaultValues.typeId ? String(defaultValues.typeId) : "",
        failureRate: defaultValues.failureRate?.toString() || "",
        lifecycleYears: defaultValues.lifecycleYears?.toString() || "",
      };
      
      Object.entries(formattedDefaults).forEach(([key, value]) => {
        if (value !== undefined) {
          form.setValue(key as keyof ComponentFormValues, value);
        }
      });
    }
  }, [defaultValues, form]);

  // Handle form submission
  const mutation = useMutation({
    mutationFn: async (values: ComponentFormValues) => {
      // Convert string values to appropriate types for API
      const payload = {
        ...values,
        typeId: parseInt(values.typeId),
      };
      
      if (isEditing) {
        return apiRequest("PUT", `/api/components/${componentId}`, payload);
      } else {
        return apiRequest("POST", "/api/components", payload);
      }
    },
    onSuccess: async () => {
      toast({
        title: isEditing ? "部件更新成功" : "部件创建成功",
        description: isEditing ? "部件信息已更新" : "新部件已添加到系统",
      });
      
      // Invalidate related queries
      await queryClient.invalidateQueries({ queryKey: ["/api/components"] });
      
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

  const onSubmit = (values: ComponentFormValues) => {
    mutation.mutate(values);
  };

  if (isLoadingTypes) {
    return <LoadingSpinner />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="componentName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>部件名称</FormLabel>
              <FormControl>
                <Input placeholder="请输入部件名称" {...field} />
              </FormControl>
              <FormDescription>
                请输入部件的完整名称
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
                  {equipmentTypes?.map((type: any) => (
                    <SelectItem
                      key={type.typeId}
                      value={type.typeId.toString()}
                    >
                      {type.typeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                请选择部件适用的设备类型
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="importanceLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>重要性级别</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择重要性级别" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="A">A: 核心部件</SelectItem>
                  <SelectItem value="B">B: 一般重要性</SelectItem>
                  <SelectItem value="C">C: 不重要</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                请选择部件的重要性级别
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="failureRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>损坏率 (%)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="请输入损坏率" 
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                部件的预期损坏率（百分比）
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lifecycleYears"
          render={({ field }) => (
            <FormItem>
              <FormLabel>生命周期（年）</FormLabel>
              <FormControl>
                <Input 
                  placeholder="请输入部件生命周期" 
                  type="number"
                  min="0"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                部件的预期生命周期（以年为单位）
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
