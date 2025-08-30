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
                {!clerkPublishableKey || clerkPublishableKey === "" ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
                    <h3 className="text-yellow-800 font-semibold mb-2">Configuração Necessária</h3>
                    <p className="text-yellow-800 text-sm mb-4">
                      Para usar o sistema, você precisa configurar a autenticação do Clerk.
                    </p>
                    <div className="text-left text-sm text-yellow-700 space-y-2">
                      <p><strong>1.</strong> Acesse <a href="https://clerk.com" target="_blank" rel="noopener noreferrer" className="underline">clerk.com</a> e crie uma conta</p>
                      <p><strong>2.</strong> Crie uma nova aplicação</p>
                      <p><strong>3.</strong> Vá em "API Keys" no dashboard</p>
                      <p><strong>4.</strong> Copie a "Publishable key"</p>
                      <p><strong>5.</strong> Cole a chave em <code className="bg-yellow-100 px-1 rounded">frontend/config.ts</code></p>
                    </div>
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
  // Only render ClerkProvider if we have a valid publishable key
  if (!clerkPublishableKey || clerkPublishableKey === "") {
    return (
      <QueryClientProvider client={queryClient}>
        <AppInner />
      </QueryClientProvider>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <QueryClientProvider client={queryClient}>
        <AppInner />
      </QueryClientProvider>
    </ClerkProvider>
  );
}
