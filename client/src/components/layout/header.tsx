import React from "react";
import { useLocation } from "wouter";
import { ChevronRight, BellRing, User } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface BreadcrumbItem {
  href?: string;
  label: string;
}

interface HeaderProps {
  breadcrumbs?: BreadcrumbItem[];
}

export function Header({ breadcrumbs = [] }: HeaderProps) {
  // Add home breadcrumb if not provided
  const items = breadcrumbs.length > 0 
    ? breadcrumbs 
    : [{ label: "首页", href: "/dashboard" }];

  return (
    <header className="bg-white shadow">
      <div className="flex justify-between items-center px-4 h-16">
        <div>
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              {items.map((item, index) => {
                const isLast = index === items.length - 1;
                
                return (
                  <li key={index} className={isLast ? "text-primary" : ""}>
                    {index > 0 && (
                      <div className="flex items-center">
                        <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />
                      </div>
                    )}
                    
                    {isLast || !item.href ? (
                      <span className={`${isLast ? "text-primary font-medium" : "text-gray-700"}`}>
                        {item.label}
                      </span>
                    ) : (
                      <a
                        href={item.href}
                        className="text-gray-700 hover:text-primary"
                      >
                        {item.label}
                      </a>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <BellRing className="h-5 w-5 text-gray-500" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>管理</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>我的账户</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>个人资料</span>
              </DropdownMenuItem>
              <DropdownMenuItem>系统设置</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>退出登录</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
