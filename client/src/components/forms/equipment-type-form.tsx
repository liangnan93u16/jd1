import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertEquipmentTypeSchema } from "@shared/schema";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Create a schema that extends insertEquipmentTypeSchema
const equipmentTypeFormSchema = insertEquipmentTypeSchema.extend({
  typeName: z.string().min(1, "设备类型名称不能为空"),
  lifecycleYears: z.string().optional().transform(val => val ? parseInt(val) : undefined),
});

type EquipmentTypeFormValues = z.infer<typeof equipmentTypeFormSchema>;

interface EquipmentTypeFormProps {
  defaultValues?: Partial<EquipmentTypeFormValues>;
  typeId?: number;
  onSuccess?: () => void;
}

export function EquipmentTypeForm({
  defaultValues,
  typeId,
  onSuccess,
}: EquipmentTypeFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!typeId;

  // Prepare default values for the form
  const formDefaults = {
    typeName: "",
    ...defaultValues,
    // Convert lifecycle years to string for form input
    lifecycleYears: defaultValues?.lifecycleYears?.toString() || "",
  };

  const form = useForm<EquipmentTypeFormValues>({
    resolver: zodResolver(equipmentTypeFormSchema),
    defaultValues: formDefaults,
  });

  const mutation = useMutation({
    mutationFn: async (values: EquipmentTypeFormValues) => {
      if (isEditing) {
        return apiRequest("PUT", `/api/equipment-types/${typeId}`, values);
      } else {
        return apiRequest("POST", "/api/equipment-types", values);
      }
    },
    onSuccess: async () => {
      toast({
        title: isEditing ? "设备类型更新成功" : "设备类型创建成功",
        description: isEditing ? "设备类型信息已更新" : "新设备类型已添加到系统",
      });
      
      // Invalidate the query to refresh the data
      await queryClient.invalidateQueries({ queryKey: ["/api/equipment-types"] });
      
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

  const onSubmit = (values: EquipmentTypeFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="typeName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>设备类型名称</FormLabel>
              <FormControl>
                <Input placeholder="请输入设备类型名称" {...field} />
              </FormControl>
              <FormDescription>
                设备类型的名称，如"数控机床"、"注塑机"等
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
                  placeholder="请输入设备生命周期" 
                  type="number"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                设备整体预期生命周期（以年为单位）
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
