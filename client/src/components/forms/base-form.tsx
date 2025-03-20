import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertBaseSchema } from "@shared/schema";
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

// Create a base form schema that extends insertBaseSchema
const baseFormSchema = insertBaseSchema.extend({
  baseName: z.string().min(1, "基地名称不能为空"),
});

type BaseFormValues = z.infer<typeof baseFormSchema>;

interface BaseFormProps {
  defaultValues?: BaseFormValues;
  baseId?: number;
  onSuccess?: () => void;
}

export function BaseForm({ defaultValues, baseId, onSuccess }: BaseFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!baseId;

  const form = useForm<BaseFormValues>({
    resolver: zodResolver(baseFormSchema),
    defaultValues: defaultValues || {
      baseName: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: BaseFormValues) => {
      if (isEditing) {
        return apiRequest("PUT", `/api/bases/${baseId}`, values);
      } else {
        return apiRequest("POST", "/api/bases", values);
      }
    },
    onSuccess: async () => {
      toast({
        title: isEditing ? "基地更新成功" : "基地创建成功",
        description: isEditing ? "基地信息已更新" : "新基地已添加到系统",
      });
      
      // Invalidate the bases query to refresh the data
      await queryClient.invalidateQueries({ queryKey: ["/api/bases"] });
      
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

  const onSubmit = (values: BaseFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="baseName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>基地名称</FormLabel>
              <FormControl>
                <Input placeholder="请输入基地名称" {...field} />
              </FormControl>
              <FormDescription>
                请输入基地的完整名称
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
