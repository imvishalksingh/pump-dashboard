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
  MailIcon
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/utils/roles";

const getNavItems = (role) => {
  const baseItems = [
    { title: "Reports", icon: BarChart3, url: "/reports" },
    { title: "Alerts", icon: AlertCircle, url: "/alerts" },
  ];

  const moduleItems = [
    { title: "Fuel Stock", icon: Package, url: "/fuel-stock" },
    { title: "Sales Management", icon: DollarSign, url: "/sales-management" },
    { title: "Price & Product", icon: Tag, url: "/price-products" },
    { title: "Pump & Nozzle", icon: Fuel, url: "/pumps" },
    { title: "Nozzleman Management", icon: Users, url: "/nozzleman-management" },
    { title: "Shift & Attendance", icon: Clock, url: "/shifts" },
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
      // { title: "Reports", icon: BarChart3, url: "/reports" },
      { title: "Alerts", icon: AlertCircle, url: "/alerts" },
      { title: "Notifications", icon: LucideBellRing, url: "/notifications" },
    ];
  }

  return baseItems;
};

export const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user } = useAuth();
  const navItems = getNavItems(user?.role || ROLES.ADMIN);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 z-40",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo & Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Package className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-sidebar-foreground">PetrolPump</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 hover:bg-sidebar-accent rounded-lg transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-sidebar-foreground" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-sidebar-foreground" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-2 space-y-1 overflow-y-auto">
        {navItems.map((item, idx) =>
          'type' in item && item.type === "divider" ? (
            <div key={idx} className="my-2 border-t border-sidebar-border opacity-40" />
          ) : 'url' in item ? (
            <NavLink
              key={item.url}
              to={item.url}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.title}</span>}
            </NavLink>
          ) : null
        )}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
              <span className="text-xs font-semibold text-sidebar-accent-foreground">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate capitalize">
                {user?.role || 'Unknown Role'}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};