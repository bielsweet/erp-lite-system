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
              <SignInButton mode="modal">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                  Entrar no Sistema
                </button>
              </SignInButton>
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
  if (!clerkPublishableKey) {
    throw new Error("Missing Clerk Publishable Key");
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <QueryClientProvider client={queryClient}>
        <AppInner />
      </QueryClientProvider>
    </ClerkProvider>
  );
}
