import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

export default function Callback() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState("Authenticating...");
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double execution in strict mode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    try {
      const params = new URLSearchParams(window.location.search);

      const token = params.get("token");
      const email = params.get("email");
      const name = params.get("name");
      const id = params.get("id");
      const message = params.get("message");
      const isAdmin = params.get("isAdmin") === "true"; // Check if user is admin

        // Use AuthContext to login
        login(token, email, name, id);

        setStatus("Authentication successful! Redirecting...");
        
        // Navigate after a brief delay
        setTimeout(() => {
          navigate("/products", { replace: true });
        }, 300);
    } catch (error) {
      setStatus("An error occurred. Redirecting to login...");
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 2000);
    }
  }, [navigate, login]);

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full text-center">
        <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-6"></div>
        <p className="text-gray-700 font-medium">{status}</p>
      </div>
    </div>
  );
}
