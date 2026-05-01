import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="page-state">Loading workspace...</div>;
  }

  return token ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;