import { createContext, useContext, useEffect, useState } from "react";

const AdminContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem("adminToken");
      const adminData = localStorage.getItem("adminData");
      
      if (token && adminData) {
        const parsedAdminData = JSON.parse(adminData);
        setIsAuthenticated(true);
        setAdmin(parsedAdminData);
      }
    } catch (error) {
      console.error("Error parsing admin data:", error);
      // Clear corrupted data
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminData");
      setIsAuthenticated(false);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (adminData, token) => {
    try {
      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminData", JSON.stringify(adminData));
      setIsAuthenticated(true);
      setAdmin(adminData);
    } catch (error) {
      console.error("Error saving admin data:", error);
      throw new Error("Failed to save authentication data");
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    setIsAuthenticated(false);
    setAdmin(null);
  };

  const value = {
    isAuthenticated,
    login,
    logout,
    admin,
    loading
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};