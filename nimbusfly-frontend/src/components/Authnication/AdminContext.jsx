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
    console.log('AdminContext useEffect - initializing...');
    try {
      const token = localStorage.getItem("adminToken");
      const adminData = localStorage.getItem("adminData");
      
      console.log('AdminContext - token:', token);
      console.log('AdminContext - adminData:', adminData);
      
      if (token && adminData) {
        const parsedAdminData = JSON.parse(adminData);
        console.log('AdminContext - parsed admin data:', parsedAdminData);
        console.log('AdminContext - has airline_id?', !!parsedAdminData.airline_id);
        console.log('AdminContext - airline_id value:', parsedAdminData.airline_id);
        
        // Clear old cached data that doesn't have airline_id
        if (!parsedAdminData.airline_id) {
          console.log('AdminContext - clearing old data without airline_id');
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminData");
          setIsAuthenticated(false);
          setAdmin(null);
        } else {
          setIsAuthenticated(true);
          setAdmin(parsedAdminData);
        }
      } else {
        console.log('AdminContext - no valid token or admin data found');
        setIsAuthenticated(false);
        setAdmin(null);
      }
    } catch (error) {
      console.error("Error parsing admin data:", error);
      // Clear corrupted data
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminData");
      setIsAuthenticated(false);
      setAdmin(null);
    } finally {
      console.log('AdminContext - setting loading to false');
      setLoading(false);
    }
  }, []);

  const login = (adminData, token) => {
    try {
      console.log('AdminContext login called with:', { adminData, token });
      
      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminData", JSON.stringify(adminData));
      
      console.log('Data stored in localStorage:');
      console.log('adminToken:', localStorage.getItem("adminToken"));
      console.log('adminData:', localStorage.getItem("adminData"));
      
      setIsAuthenticated(true);
      setAdmin(adminData);
      
      console.log('AdminContext state updated - isAuthenticated: true, admin:', adminData);
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