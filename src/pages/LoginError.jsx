import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";

function LoginError() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>

          {/* Error Title */}
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-3">
            Access Denied
          </h1>

          {/* Error Message */}
          <p className="text-center text-gray-600 mb-2">
            Only admin users can access this dashboard.
          </p>
          <p className="text-center text-gray-500 text-sm mb-8">
            If you believe this is an error, please contact the administrator.
          </p>

          {/* Back to Login Button */}
          <button
            onClick={() => navigate("/")}
            className="w-full px-6 py-3 bg-red-600 text-white font-semibold rounded-lg
            hover:bg-red-700 transition-all duration-200
            active:scale-95 flex items-center justify-center gap-2"
          >
            <span>← Back to Login</span>
          </button>

          {/* Footer Info */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-600 font-semibold mb-1">
              OSA Embroidery
            </p>
            <p className="text-gray-500 text-sm">Admin Dashboard</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginError;
