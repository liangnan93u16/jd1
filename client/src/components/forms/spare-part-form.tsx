import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertSparePartSchema } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Create a form schema that extends insertSparePartSchema
const sparePartFormSchema = insertSparePartSchema.extend({
  materialCode: z.string().min(1, "物料编号不能为空"),
  manufacturer: z.string().min(1, "制造商不能为空"),
  manufacturerMaterialCode: z.string().optional(),
  specification: z.string().optional(),
  description: z.string().optional(),
  isCustom: z.boolean().default(false),
});

type SparePartFormValues = z.infer<typeof sparePartFormSchema>;

interface SparePartFormProps {
  defaultValues?: Partial<SparePartFormValues>;
  sparePartId?: number;
  onSuccess?: () => void;
}

export function SparePartForm({
  defaultValues,
  sparePartId,
  onSuccess,
}: SparePartFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!sparePartId;

  // Prepare default values for the form
  const formDefaults = {
    materialCode: "",
    manufacturer: "",
    manufacturerMaterialCode: "",
    specification: "",
    description: "",
    isCustom: false,
    ...defaultValues,
  };

  const form = useForm<SparePartFormValues>({
    resolver: zodResolver(sparePartFormSchema),
    defaultValues: formDefaults,
  });

  const mutation = useMutation({
    mutationFn: async (values: SparePartFormValues) => {
      if (isEditing) {
        return apiRequest("PUT", `/api/spare-parts/${sparePartId}`, values);
      } else {
        return apiRequest("POST", "/api/spare-parts", values);
      }
    },
    onSuccess: async () => {
      toast({
        title: isEditing ? "备件更新成功" : "备件创建成功",
        description: isEditing ? "备件信息已更新" : "新备件已添加到系统",
      });
      
      // Invalidate the query to refresh the data
      await queryClient.invalidateQueries({ queryKey: ["/api/spare-parts"] });
      
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

  const onSubmit = (values: SparePartFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="materialCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>物料编号</FormLabel>
              <FormControl>
                <Input placeholder="请输入物料编号" {...field} />
              </FormControl>
              <FormDescription>
                备件/物料的唯一编号
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="manufacturer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>制造商</FormLabel>
              <FormControl>
                <Input placeholder="请输入制造商" {...field} />
              </FormControl>
              <FormDescription>
                生产该备件的制造商
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="manufacturerMaterialCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>制造商物料编号</FormLabel>
              <FormControl>
                <Input placeholder="请输入制造商物料编号" {...field} />
              </FormControl>
              <FormDescription>
                制造商提供的物料编号（选填）
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specification"
          render={({ field }) => (
            <FormItem>
              <FormLabel>规格型号</FormLabel>
              <FormControl>
                <Input placeholder="请输入规格型号" {...field} />
              </FormControl>
              <FormDescription>
                备件的规格型号信息（选填）
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>物料描述</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="请输入物料描述" 
                  rows={3}
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                详细描述备件的用途和特点（选填）
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isCustom"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">是否定制件</FormLabel>
                <FormDescription>
                  标记此备件是否为定制件
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
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
