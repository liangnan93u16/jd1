import React, { useState } from "react";
import { Layout } from "@/components/layout/layout";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import type { ExtendedAssociation } from "@shared/schema";

export default function QueryPage() {
  const { toast } = useToast();
  
  // Query parameters
  const [queryType, setQueryType] = useState<'association' | 'supplier'>('association');
  const [baseId, setBaseId] = useState<string>('');
  const [workshopId, setWorkshopId] = useState<string>('');
  const [typeId, setTypeId] = useState<string>('');
  const [importanceLevels, setImportanceLevels] = useState<string[]>(['A', 'B']);
  const [supplyCycleRange, setSupplyCycleRange] = useState<[string, string]>(['', '']);
  const [isCustom, setIsCustom] = useState<string>('all');
  const [keyword, setKeyword] = useState<string>('');
  
  // Submit status
  const [hasSubmitted, setHasSubmitted] = useState(false);
  
  // Fetch base data for filters
  const { data: bases } = useQuery({
    queryKey: ["/api/bases"],
  });

  // Fetch workshop data based on selected base
  const { data: workshops } = useQuery({
    queryKey: ["/api/workshops", baseId],
    queryFn: async () => {
      const url = baseId 
        ? `/api/workshops?baseId=${baseId}`
        : "/api/workshops";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch workshops");
      return res.json();
    },
  });

  // Fetch equipment type data for filters
  const { data: equipmentTypes } = useQuery({
    queryKey: ["/api/equipment-types"],
  });
  
  // Query for advanced search results
  const {
    data: queryResults,
    isLoading: isLoadingResults,
    error,
  } = useQuery({
    queryKey: ["/api/associations/query", queryType, baseId, workshopId, typeId, importanceLevels, supplyCycleRange, isCustom, keyword, hasSubmitted],
    queryFn: async () => {
      if (!hasSubmitted) return null;
      
      const params = new URLSearchParams();
      
      if (baseId) params.append("baseId", baseId);
      if (workshopId) params.append("workshopId", workshopId);
      if (typeId) params.append("typeId", typeId);
      
      if (importanceLevels.length > 0) {
        params.append("importanceLevel", importanceLevels.join(','));
      }
      
      if (supplyCycleRange[0] || supplyCycleRange[1]) {
        const min = supplyCycleRange[0] || '0';
        const max = supplyCycleRange[1] || '999';
        params.append("supplyCycleRange", `${min},${max}`);
      }
      
      if (isCustom !== 'all') {
        params.append("isCustom", isCustom === 'yes' ? 'true' : 'false');
      }
      
      if (keyword) {
        params.append("keyword", keyword);
      }
      
      const url = `/api/associations?${params.toString()}`;
      const res = await fetch(url);
      
      if (!res.ok) throw new Error("查询失败");
      return res.json();
    },
    enabled: hasSubmitted,
  });
  
  // Show error toast if query fails
  React.useEffect(() => {
    if (error) {
      toast({
        title: "查询失败",
        description: (error as Error).message || "发生未知错误",
        variant: "destructive",
      });
    }
  }, [error, toast]);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
  };
  
  // Handle reset filters
  const handleReset = () => {
    setBaseId('');
    setWorkshopId('');
    setTypeId('');
    setImportanceLevels(['A', 'B']);
    setSupplyCycleRange(['', '']);
    setIsCustom('all');
    setKeyword('');
    setHasSubmitted(false);
  };
  
  // Define table columns for association results
  const associationColumns = [
    {
      header: "设备名称",
      accessorKey: "equipmentName",
    },
    {
      header: "部件名称",
      accessorKey: "componentName",
    },
    {
      header: "重要性",
      accessorKey: "importanceLevel",
      cell: (row: ExtendedAssociation) => {
        const level = row.importanceLevel;
        let variant = "default";
        
        switch (level) {
          case "A":
            variant = "importanceA";
            break;
          case "B":
            variant = "importanceB";
            break;
          case "C":
            variant = "importanceC";
            break;
        }
        
        return <Badge variant={variant as any}>{level}</Badge>;
      },
    },
    {
      header: "物料编号",
      accessorKey: "materialCode",
    },
    {
      header: "备件名称",
      accessorKey: "sparePartName",
      cell: (row: ExtendedAssociation) => row.sparePartName || "-",
    },
    {
      header: "规格型号",
      accessorKey: "specification",
      cell: (row: ExtendedAssociation) => row.specification || "-",
    },
    {
      header: "制造商",
      accessorKey: "manufacturer",
    },
    {
      header: "供应商",
      accessorKey: "supplierName",
      cell: (_row: ExtendedAssociation) => "待补充", // This would be available in a real implementation
    },
    {
      header: "供货周期",
      accessorKey: "supplyCycleWeeks",
      cell: (_row: ExtendedAssociation) => "待补充", // This would be available in a real implementation
    },
  ];
  
  return (
    <Layout
      breadcrumbs={[
        { label: "首页", href: "/dashboard" },
        { label: "高级查询" },
      ]}
      title="高级查询"
    >
      <div className="mb-6">
        <p className="text-gray-500">
          查询设备、部件和备件之间的关联关系
        </p>
      </div>
      
      {/* Query Builder */}
      <Card className="mb-8">
        <CardContent className="pt-6 space-y-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-gray-900">查询条件</h2>
                
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">查询类型</Label>
                  <div className="mt-2 space-x-2">
                    <RadioGroup 
                      value={queryType} 
                      onValueChange={(value) => setQueryType(value as 'association' | 'supplier')}
                      className="flex flex-row space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="association" id="query-type-1" />
                        <Label htmlFor="query-type-1">设备-部件-备件关系</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="supplier" id="query-type-2" />
                        <Label htmlFor="query-type-2">备件供应商查询</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="base-filter" className="block text-sm font-medium text-gray-700 mb-1">基地</Label>
                  <Select
                    value={baseId}
                    onValueChange={setBaseId}
                  >
                    <SelectTrigger id="base-filter">
                      <SelectValue placeholder="全部基地" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">全部基地</SelectItem>
                      {bases?.map((base: any) => (
                        <SelectItem key={base.baseId} value={base.baseId.toString()}>
                          {base.baseName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="workshop-filter" className="block text-sm font-medium text-gray-700 mb-1">车间</Label>
                  <Select
                    value={workshopId}
                    onValueChange={setWorkshopId}
                    disabled={!baseId}
                  >
                    <SelectTrigger id="workshop-filter">
                      <SelectValue placeholder="全部车间" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">全部车间</SelectItem>
                      {workshops?.filter((w: any) => 
                        !baseId || w.baseId.toString() === baseId
                      ).map((workshop: any) => (
                        <SelectItem key={workshop.workshopId} value={workshop.workshopId.toString()}>
                          {workshop.workshopName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-1">设备类型</Label>
                  <Select
                    value={typeId}
                    onValueChange={setTypeId}
                  >
                    <SelectTrigger id="type-filter">
                      <SelectValue placeholder="全部类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">全部类型</SelectItem>
                      {equipmentTypes?.map((type: any) => (
                        <SelectItem key={type.typeId} value={type.typeId.toString()}>
                          {type.typeName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Right Column */}
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-gray-900">高级筛选</h2>
                
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">部件重要性</Label>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="importance-A" 
                        checked={importanceLevels.includes('A')}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setImportanceLevels([...importanceLevels, 'A']);
                          } else {
                            setImportanceLevels(importanceLevels.filter(l => l !== 'A'));
                          }
                        }}
                      />
                      <Label htmlFor="importance-A">A-核心部件</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="importance-B" 
                        checked={importanceLevels.includes('B')}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setImportanceLevels([...importanceLevels, 'B']);
                          } else {
                            setImportanceLevels(importanceLevels.filter(l => l !== 'B'));
                          }
                        }}
                      />
                      <Label htmlFor="importance-B">B-一般重要性</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="importance-C" 
                        checked={importanceLevels.includes('C')}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setImportanceLevels([...importanceLevels, 'C']);
                          } else {
                            setImportanceLevels(importanceLevels.filter(l => l !== 'C'));
                          }
                        }}
                      />
                      <Label htmlFor="importance-C">C-不重要</Label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">供货周期(周)</Label>
                  <div className="flex items-center space-x-2">
                    <Input 
                      type="number" 
                      min="0" 
                      placeholder="最小值" 
                      value={supplyCycleRange[0]}
                      onChange={(e) => setSupplyCycleRange([e.target.value, supplyCycleRange[1]])}
                    />
                    <span>-</span>
                    <Input 
                      type="number" 
                      min="0" 
                      placeholder="最大值" 
                      value={supplyCycleRange[1]}
                      onChange={(e) => setSupplyCycleRange([supplyCycleRange[0], e.target.value])}
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">是否定制件</Label>
                  <RadioGroup 
                    value={isCustom} 
                    onValueChange={setIsCustom}
                    className="flex flex-row space-x-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="custom-all" />
                      <Label htmlFor="custom-all">全部</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="custom-yes" />
                      <Label htmlFor="custom-yes">是</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="custom-no" />
                      <Label htmlFor="custom-no">否</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">物料关键词</Label>
                  <Input 
                    placeholder="例如：轴承、电机..." 
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <div className="pt-4 mt-4 border-t border-gray-200 flex justify-end space-x-3">
              <Button variant="outline" type="button" onClick={handleReset}>
                重置
              </Button>
              <Button type="submit">
                查询
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Query Results */}
      {hasSubmitted && (
        <Card>
          <CardHeader className="pb-0">
            <CardTitle>查询结果</CardTitle>
            <CardDescription>
              共找到 {queryResults?.length || 0} 条匹配结果
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {isLoadingResults ? (
              <LoadingSpinner className="h-40" />
            ) : (
              <DataTable
                data={queryResults || []}
                columns={associationColumns}
                isLoading={false}
              />
            )}
          </CardContent>
        </Card>
      )}
    </Layout>
  );
}
