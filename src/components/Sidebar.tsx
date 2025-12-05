// Sidebar.tsx - UPDATED VERSION
import {
  Home,
  BarChart3,
  Package,
  Users,
  Settings,
  DollarSign,
  FileText,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Fuel,
  Clock,
  Wallet,
  Tag,
  ChartColumnBig,
  LucideBellRing,
  CogIcon,
  MailIcon,
  IndianRupee,
  Edit,
  Eye,
  List,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  DatabaseBackupIcon
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/utils/roles";
import { useState } from "react";

const getNavItems = (role) => {
  const baseItems = [
    { title: "Reports", icon: BarChart3, url: "/reports" },
    { title: "Alerts", icon: AlertCircle, url: "/alerts" },
  ];

  const moduleItems = [
    { title: "Fuel Stock", icon: Package, url: "/fuel-stock" },
    { 
      title: "Sales Management", 
      icon: IndianRupee, 
      url: "/sales-management",
      children: [
        // { title: "Sales Overview", icon: Eye, url: "/sales-management/overview" },
        { title: "Sales Data", icon: DatabaseBackupIcon, url: "/sales-management/edit" },
      ]
    },
    { title: "Price & Product", icon: Tag, url: "/price-products" },
    { title: "Pump & Nozzle", icon: Fuel, url: "/pumps" },
    { title: "Nozzleman Management", icon: Users, url: "/nozzleman-management" },
    { title: "Credit Customers", icon: Users, url: "/credit-customers" },
    { title: "Expense & Cash", icon: Wallet, url: "/expense-cash" },
  ];

  if (role === ROLES.ADMIN) {
    return [
      { title: "Dashboard", icon: Home, url: "/" },
      ...moduleItems,
      { type: "divider" },
      ...baseItems,
      { type: "divider" },
      { title: "User Management", icon: Users, url: "/admin/users" },
      { title: "Invitations", icon: MailIcon, url: "/admin/invitations" },
      { title: "Settings", icon: Settings, url: "/settings" },
      { title: "Backup Management", icon: FileText, url: "/backup-management" },
    ];
  }

  if (role === ROLES.MANAGER) {
    return [
      { title: "Dashboard", icon: Home, url: "/dashboard/manager" },
      ...baseItems,
      { type: "divider" },
      ...moduleItems,
      { title: "Settings", icon: Settings, url: "/settings" },
    ];
  }

  if (role === ROLES.AUDITOR) {
    return [
      { title: "Dashboard", icon: Home, url: "/dashboard/auditor" },
      { title: "Alerts", icon: AlertCircle, url: "/alerts" },
      { title: "Notifications", icon: LucideBellRing, url: "/notifications" },
    ];
  }

  return baseItems;
};

const NavItem = ({ item, collapsed, isChild = false }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const hasChildren = item.children && item.children.length > 0;
  const isActive = hasChildren 
    ? location.pathname.startsWith(item.url)
    : location.pathname === item.url;

  if (hasChildren) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center justify-between w-full px-3 py-2 rounded-lg transition-all duration-200",
            isActive
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <div className="flex items-center gap-3">
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {!collapsed && (
              <span className="font-medium text-sm tracking-tight leading-tight">
                {item.title}
              </span>
            )}
          </div>
          {!collapsed && (
            isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />
          )}
        </button>
        
        {!collapsed && isOpen && (
          <div className="ml-6 space-y-1 border-l border-sidebar-border pl-2">
            {item.children.map((child) => (
              <NavLink
                key={child.url}
                to={child.url}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )
                }
              >
                <child.icon className="w-3 h-3 flex-shrink-0" />
                <span className="font-medium tracking-tight leading-tight">
                  {child.title}
                </span>
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.url}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
          isActive
            ? "bg-sidebar-primary text-sidebar-primary-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          isChild && "text-sm ml-6"
        )
      }
    >
      <item.icon className="w-4 h-4 flex-shrink-0" />
      {!collapsed && (
        <span className="font-medium text-sm tracking-tight leading-tight">
          {item.title}
        </span>
      )}
    </NavLink>
  );
};

export const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user } = useAuth();
  const navItems = getNavItems(user?.role || ROLES.ADMIN);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 z-40 flex flex-col group",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo & Toggle */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Package className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-sidebar-foreground text-sm">PetrolPump</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 hover:bg-sidebar-accent rounded-lg transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-sidebar-foreground" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-sidebar-foreground" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <nav 
          className={cn(
            "flex-1 overflow-y-auto py-2 px-2 space-y-1",
            "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-sidebar-border",
            "hover:scrollbar-thumb-sidebar-foreground/30",
            "transition-colors duration-300",
            "scrollbar-thumb-rounded-full",
            "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-transparent",
            "hover:[&::-webkit-scrollbar-thumb]:bg-sidebar-foreground/30"
          )}
        >
          {navItems.map((item, idx) =>
            'type' in item && item.type === "divider" ? (
              <div key={idx} className="my-2 border-t border-sidebar-border opacity-40" />
            ) : 'url' in item ? (
              <NavItem 
                key={item.url} 
                item={item} 
                collapsed={collapsed}
              />
            ) : null
          )}
        </nav>
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="flex-shrink-0 border-t border-sidebar-border">
          <div className="p-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-sidebar-accent flex items-center justify-center">
                <span className="text-xs font-semibold text-sidebar-accent-foreground">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-sidebar-foreground truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate capitalize">
                  {user?.role || 'Unknown Role'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};