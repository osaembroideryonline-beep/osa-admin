import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

import AddProduct from "./pages/AddProduct";
import Products from "./pages/Products";
import AddMachinery from "./pages/AddMachinery";
import Machinery from "./pages/Machinery";
import Users from "./pages/Users";
import LoginError from "./pages/LoginError";
import Callback from "./Callback";
import AddEmbroideryMachine from "./pages/AddEmbroideryMachine";
import EmbroideryMachines from "./pages/EmbroideryMachines";

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { auth } = useAuth();
  if (!auth.isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      window.location.href =
        `${API_BASE_URL}/admin/login`;
    }, 250);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className=" rounded-lg  p-8">
          <div className="text-center mb-8">
            <img src="https://res.cloudinary.com/dobuwrfn8/image/upload/v1765785794/osamainlogowide_qa3saa.png" alt="" />
            <p className="text-gray-600 font-medium text-lg">Admin Dashboard</p>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full cursor-pointer flex items-center justify-center gap-3 px-6 py-3 
            border-2 border-gray-300 rounded-lg font-semibold text-gray-700 
            hover:bg-gray-50 hover:border-gray-400 transition-all 
            disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Admin access only</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  return (
    <Routes>
      <Route path="/callback" element={<Callback />} />
      <Route path="/loginerror" element={<LoginError />} />

      <Route path="/" element={<LoginPage />} />

      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        }
      />

      <Route
        path="/add-product"
        element={
          <ProtectedRoute>
            <AddProduct />
          </ProtectedRoute>
        }
      />

      <Route
        path="/machinery"
        element={
          <ProtectedRoute>
            <Machinery />
          </ProtectedRoute>
        }
      />

      <Route
        path="/add-machinery"
        element={
          <ProtectedRoute>
            <AddMachinery />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        }
      />

      <Route
        path="/embroidery-machines"
        element={
          <ProtectedRoute>
            <EmbroideryMachines />
          </ProtectedRoute>
        }
      />

      <Route
        path="/add-embroidery-machine"
        element={
          <ProtectedRoute>
            <AddEmbroideryMachine />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
