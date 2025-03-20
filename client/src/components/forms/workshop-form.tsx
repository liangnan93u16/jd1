import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertWorkshopSchema } from "@shared/schema";
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

// Create a workshop form schema that extends insertWorkshopSchema
const workshopFormSchema = insertWorkshopSchema.extend({
  workshopName: z.string().min(1, "车间名称不能为空"),
  baseId: z.string().min(1, "请选择基地"),
  busyLevel: z.string().min(1, "请选择作业级别"),
});

type WorkshopFormValues = z.infer<typeof workshopFormSchema>;

interface WorkshopFormProps {
  defaultValues?: Partial<WorkshopFormValues>;
  workshopId?: number;
  onSuccess?: () => void;
}

export function WorkshopForm({
  defaultValues,
  workshopId,
  onSuccess,
}: WorkshopFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!workshopId;

  // Fetch the list of bases for the dropdown
  const { data: bases, isLoading: isLoadingBases } = useQuery({
    queryKey: ["/api/bases"],
  });

  // Define form with default values
  const form = useForm<WorkshopFormValues>({
    resolver: zodResolver(workshopFormSchema),
    defaultValues: {
      workshopName: "",
      baseId: "",
      busyLevel: "",
      ...defaultValues,
    },
  });

  // Update form values when defaultValues changes
  useEffect(() => {
    if (defaultValues) {
      // Need to convert number values to strings for select inputs
      const formattedDefaults = {
        ...defaultValues,
        baseId: defaultValues.baseId ? String(defaultValues.baseId) : "",
        busyLevel: defaultValues.busyLevel || "",
      };
      
      Object.entries(formattedDefaults).forEach(([key, value]) => {
        if (value !== undefined) {
          form.setValue(key as keyof WorkshopFormValues, value);
        }
      });
    }
  }, [defaultValues, form]);

  // Handle form submission
  const mutation = useMutation({
    mutationFn: async (values: WorkshopFormValues) => {
      // Convert string IDs to numbers for API
      const payload = {
        ...values,
        baseId: parseInt(values.baseId),
      };
      
      if (isEditing) {
        return apiRequest("PUT", `/api/workshops/${workshopId}`, payload);
      } else {
        return apiRequest("POST", "/api/workshops", payload);
      }
    },
    onSuccess: async () => {
      toast({
        title: isEditing ? "车间更新成功" : "车间创建成功",
        description: isEditing ? "车间信息已更新" : "新车间已添加到系统",
      });
      
      // Invalidate related queries
      await queryClient.invalidateQueries({ queryKey: ["/api/workshops"] });
      
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

  const onSubmit = (values: WorkshopFormValues) => {
    mutation.mutate(values);
  };

  if (isLoadingBases) {
    return <LoadingSpinner />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="workshopName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>车间名称</FormLabel>
              <FormControl>
                <Input placeholder="请输入车间名称" {...field} />
              </FormControl>
              <FormDescription>
                请输入车间的完整名称
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="baseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>所属基地</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择基地" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {bases?.map((base: any) => (
                    <SelectItem key={base.baseId} value={base.baseId.toString()}>
                      {base.baseName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                请选择车间所属的基地
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="busyLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>作业级别</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择作业级别" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">1: 连续作业</SelectItem>
                  <SelectItem value="2">2: 正常作业</SelectItem>
                  <SelectItem value="3">3: 间歇作业</SelectItem>
                  <SelectItem value="4">4: 不作业</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                请选择车间的作业级别
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
