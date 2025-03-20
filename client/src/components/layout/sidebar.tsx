import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Factory,
  Home,
  Search,
  Settings,
  Package,
  Truck,
  Cog,
  Wrench,
  Monitor,
  Puzzle,
  X,
  Menu,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  indented?: boolean;
  onClick?: () => void;
}

function NavItem({ href, icon, children, indented = false, onClick }: NavItemProps) {
  const [location] = useLocation();
  const isActive = location === href;

  return (
    <Link href={href}>
      <a
        className={cn(
          "flex items-center py-2 px-3 rounded-md text-sm font-medium",
          isActive
            ? "bg-gray-800 text-white"
            : "text-gray-300 hover:bg-gray-700 hover:text-white",
          indented && "ml-2"
        )}
        onClick={onClick}
      >
        <span className="mr-3 text-xl">{icon}</span>
        {children}
      </a>
    </Link>
  );
}

interface NavGroupProps {
  title: string;
  children: React.ReactNode;
  onClick?: () => void;
}

function NavGroup({ title, children, onClick }: NavGroupProps) {
  return (
    <div>
      <div
        className="border-l-4 border-primary px-3 py-2 text-sm font-medium text-gray-300"
        onClick={onClick}
      >
        {title}
      </div>
      <div className="mt-1 space-y-1">{children}</div>
    </div>
  );
}

export function Sidebar() {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const closeSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {isMobile && (
        <Button
          variant="ghost"
          className="md:hidden fixed top-4 left-4 z-50"
          onClick={toggleSidebar}
        >
          <Menu />
        </Button>
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out",
          isMobile ? (isOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"
        )}
      >
        <div className="flex items-center justify-between px-4 h-16 bg-gray-800">
          <div className="flex items-center">
            <Cog className="mr-2 h-6 w-6" />
            <span className="text-xl font-semibold">设备管理系统</span>
          </div>
          {isMobile && (
            <button
              className="text-white focus:outline-none"
              onClick={closeSidebar}
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>

        <nav className="mt-5 px-2 space-y-3">
          <NavItem href="/dashboard" icon={<Home />} onClick={closeSidebar}>
            仪表盘
          </NavItem>

          <Separator className="my-2 bg-gray-700" />

          <NavGroup title="主数据管理" onClick={closeSidebar}>
            <NavItem href="/base" icon={<Factory />} indented onClick={closeSidebar}>
              基地管理
            </NavItem>
            <NavItem href="/workshop" icon={<Settings />} indented onClick={closeSidebar}>
              车间管理
            </NavItem>
            <NavItem href="/equipment-type" icon={<Wrench />} indented onClick={closeSidebar}>
              设备类型
            </NavItem>
            <NavItem href="/equipment" icon={<Monitor />} indented onClick={closeSidebar}>
              设备管理
            </NavItem>
            <NavItem href="/component" icon={<Puzzle />} indented onClick={closeSidebar}>
              部件管理
            </NavItem>
          </NavGroup>

          <NavGroup title="备件管理" onClick={closeSidebar}>
            <NavItem href="/spare-part" icon={<Cog />} indented onClick={closeSidebar}>
              备件/物料
            </NavItem>
            <NavItem href="/supplier" icon={<Truck />} indented onClick={closeSidebar}>
              供应商管理
            </NavItem>
            <NavItem href="/association" icon={<LinkIcon />} indented onClick={closeSidebar}>
              设备-部件-备件关联
            </NavItem>
          </NavGroup>

          <NavItem href="/query" icon={<Search />} onClick={closeSidebar}>
            高级查询
          </NavItem>
        </nav>
      </aside>
    </>
  );
}
