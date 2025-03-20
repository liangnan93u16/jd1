import React, { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TreeNode {
  id: string | number;
  name: string;
  children?: TreeNode[];
  type?: string;
  data?: any;
}

interface TreeViewItemProps {
  node: TreeNode;
  level?: number;
  expanded?: boolean;
  defaultExpanded?: boolean;
  className?: string;
  onNodeSelect?: (node: TreeNode) => void;
}

export function TreeViewItem({
  node,
  level = 0,
  expanded: controlledExpanded,
  defaultExpanded = false,
  className,
  onNodeSelect,
}: TreeViewItemProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : expanded;
  const hasChildren = node.children && node.children.length > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!isExpanded);
  };

  const handleNodeClick = () => {
    if (onNodeSelect) {
      onNodeSelect(node);
    }
  };

  return (
    <div className={cn("text-sm", className)}>
      <div 
        className={cn(
          "flex items-center py-1 px-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer",
          "transition-colors",
          level === 0 ? "font-medium" : ""
        )}
        style={{ paddingLeft: `${level * 12 + 4}px` }}
        onClick={handleNodeClick}
      >
        {hasChildren ? (
          <div
            onClick={handleToggle}
            className="mr-1 p-1 rounded-sm hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </div>
        ) : (
          <div className="w-6" />
        )}
        <span 
          className={cn(
            node.type === "基地" ? "text-blue-600 dark:text-blue-400" : "",
            node.type === "车间" ? "text-green-600 dark:text-green-400" : "",
            node.type === "设备" ? "text-orange-600 dark:text-orange-400" : "",
            node.type === "部件" ? "text-purple-600 dark:text-purple-400" : "",
            node.type === "备件" ? "text-red-600 dark:text-red-400" : "",
          )}
        >
          {node.name}
        </span>
        {node.type && (
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
            ({node.type})
          </span>
        )}
      </div>
      {hasChildren && isExpanded && (
        <div className="ml-2">
          {node.children!.map((child) => (
            <TreeViewItem
              key={child.id}
              node={child}
              level={level + 1}
              defaultExpanded={defaultExpanded}
              onNodeSelect={onNodeSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export interface TreeViewProps {
  data: TreeNode[];
  defaultExpanded?: boolean;
  className?: string;
  onNodeSelect?: (node: TreeNode) => void;
}

export function TreeView({
  data,
  defaultExpanded = false,
  className,
  onNodeSelect,
}: TreeViewProps) {
  return (
    <div className={cn("p-2 border rounded-md bg-white dark:bg-gray-950", className)}>
      {data.map((node) => (
        <TreeViewItem
          key={node.id}
          node={node}
          defaultExpanded={defaultExpanded}
          onNodeSelect={onNodeSelect}
        />
      ))}
    </div>
  );
}