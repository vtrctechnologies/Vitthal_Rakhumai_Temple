import { useNavigate } from "react-router-dom";
import { Home as HomeIcon } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-bold text-gray-800 mb-4">404</h1>
        <div className="w-24 h-1 bg-gradient-to-r from-orange-600 to-red-600 mx-auto mb-6" />
        <p className="text-2xl font-semibold mb-4 text-gray-800">
          Page Not Found
        </p>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all shadow-md hover:shadow-lg"
        >
          <HomeIcon className="h-5 w-5" />
          Return to Admin
        </button>
      </div>
    </div>
  );
};

export default NotFound;
