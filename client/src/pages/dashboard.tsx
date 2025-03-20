import React from "react";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/common/loading-spinner";

// Mock data for charts
const equipmentByTypeData = [
  { name: "数控机床", value: 12 },
  { name: "注塑机", value: 8 },
  { name: "装配线", value: 5 },
  { name: "喷涂设备", value: 7 },
  { name: "检测设备", value: 10 },
];

const equipmentByBaseData = [
  { name: "上海基地", value: 18 },
  { name: "北京基地", value: 12 },
  { name: "广州基地", value: 15 },
  { name: "深圳基地", value: 8 },
];

const partsByImportanceData = [
  { name: "A-核心部件", value: 25, color: "#ef4444" },
  { name: "B-一般重要", value: 35, color: "#f59e0b" },
  { name: "C-不重要", value: 40, color: "#10b981" },
];

export default function Dashboard() {
  // Fetch counts for dashboard cards
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      // In a real implementation, this would fetch actual data from the API
      // For now, return sample data to demonstrate the UI
      return {
        totalBases: 4,
        totalWorkshops: 12,
        totalEquipment: 45,
        totalComponents: 120,
        totalSpareParts: 250,
        totalSuppliers: 35,
      };
    },
  });

  return (
    <Layout
      breadcrumbs={[{ label: "仪表盘", href: "/dashboard" }]}
      title="仪表盘"
    >
      {isLoading ? (
        <LoadingSpinner className="h-40" />
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>基地</CardTitle>
                <CardDescription>系统中的基地总数</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats?.totalBases || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>车间</CardTitle>
                <CardDescription>系统中的车间总数</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats?.totalWorkshops || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>设备</CardTitle>
                <CardDescription>系统中的设备总数</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats?.totalEquipment || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>部件</CardTitle>
                <CardDescription>系统中的部件总数</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats?.totalComponents || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>备件/物料</CardTitle>
                <CardDescription>系统中的备件总数</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats?.totalSpareParts || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>供应商</CardTitle>
                <CardDescription>系统中的供应商总数</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats?.totalSuppliers || 0}</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>设备类型分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={equipmentByTypeData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="hsl(var(--primary))" name="设备数量" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>基地设备分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={equipmentByBaseData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="hsl(var(--chart-1))" name="设备数量" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>部件重要性分布</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={partsByImportanceData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {partsByImportanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} 个部件`, "数量"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </Layout>
  );
}
