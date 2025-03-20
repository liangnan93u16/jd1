import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TreeView, type TreeNode } from "@/components/ui/tree-view";
import { Skeleton } from "@/components/ui/skeleton";

interface TreeViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  data: TreeNode[] | null;
  isLoading: boolean;
}

export function TreeViewDialog({
  open,
  onOpenChange,
  title,
  data,
  isLoading,
}: TreeViewDialogProps) {
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);

  useEffect(() => {
    if (!open) {
      setSelectedNode(null);
    }
  }, [open]);

  const handleNodeSelect = (node: TreeNode) => {
    setSelectedNode(node);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-5/6" />
            <Skeleton className="h-6 w-4/6" />
            <Skeleton className="h-6 w-5/6" />
            <Skeleton className="h-6 w-3/6" />
          </div>
        ) : (
          <>
            {data && data.length > 0 ? (
              <div className="max-h-[60vh] overflow-auto">
                <TreeView 
                  data={data} 
                  defaultExpanded={true} 
                  onNodeSelect={handleNodeSelect}
                />
              </div>
            ) : (
              <div className="py-4 text-center text-gray-500">
                没有相关数据可显示
              </div>
            )}
          </>
        )}
        
        {selectedNode && selectedNode.data && (
          <div className="mt-4 border-t pt-4">
            <div className="font-medium mb-2">详细信息:</div>
            <div className="text-sm">
              {Object.entries(selectedNode.data).map(([key, value]) => (
                <div key={key} className="grid grid-cols-3 gap-2 mb-1">
                  <span className="text-gray-500">{key}:</span>
                  <span className="col-span-2">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}