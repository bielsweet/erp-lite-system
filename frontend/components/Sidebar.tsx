import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Truck, 
  BarChart3,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Produtos", href: "/products", icon: Package },
  { name: "PDV", href: "/pos", icon: CreditCard },
  { name: "Vendas", href: "/sales", icon: ShoppingCart },
  { name: "Financeiro", href: "/financial", icon: DollarSign },
  { name: "Entregas", href: "/deliveries", icon: Truck },
  { name: "Relatórios", href: "/reports", icon: BarChart3 },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">ERP Lite</h1>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
