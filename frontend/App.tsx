import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { clerkPublishableKey } from "./config";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { Products } from "./pages/Products";
import { POS } from "./pages/POS";
import { Sales } from "./pages/Sales";
import { Financial } from "./pages/Financial";
import { Deliveries } from "./pages/Deliveries";
import { Reports } from "./pages/Reports";

const queryClient = new QueryClient();

function AppInner() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <SignedOut>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">ERP Lite</h1>
              <div className="space-y-4">
                <p className="text-gray-600 mb-4">
                  Sistema de gestão para micro e pequenas empresas
                </p>
                {clerkPublishableKey === "pk_test_placeholder_key_for_development" ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-yellow-800 text-sm">
                      <strong>Configuração necessária:</strong><br />
                      Configure sua chave do Clerk em <code>frontend/config.ts</code> para habilitar a autenticação.
                    </p>
                  </div>
                ) : (
                  <SignInButton mode="modal">
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                      Entrar no Sistema
                    </button>
                  </SignInButton>
                )}
              </div>
            </div>
          </div>
        </SignedOut>
        
        <SignedIn>
          <div className="flex">
            <Sidebar />
            <div className="flex-1 ml-64">
              <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-semibold text-gray-900">ERP Lite</h1>
                  <UserButton afterSignOutUrl="/" />
                </div>
              </header>
              
              <main className="p-6">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/pos" element={<POS />} />
                  <Route path="/sales" element={<Sales />} />
                  <Route path="/financial" element={<Financial />} />
                  <Route path="/deliveries" element={<Deliveries />} />
                  <Route path="/reports" element={<Reports />} />
                </Routes>
              </main>
            </div>
          </div>
        </SignedIn>
        
        <Toaster />
      </div>
    </Router>
  );
}

export default function App() {
  // Use a placeholder key for development if not configured
  const publishableKey = clerkPublishableKey || "pk_test_placeholder_key_for_development";

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <QueryClientProvider client={queryClient}>
        <AppInner />
      </QueryClientProvider>
    </ClerkProvider>
  );
}
