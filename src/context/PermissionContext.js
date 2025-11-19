import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { permissionService } from "../services/permissionService";

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPermissions = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.id || !user?.role) throw new Error("User info missing");

      const role = user.role.toLowerCase();
      if (role === "admin") { 
        setPermissions("FULL_ACCESS");
        setLoading(false);
        return;
      }

      const res = await permissionService.fetchPermissionsForUser(user.id, user.role);
      setPermissions(res);
    } catch (err) {
      setError(err.message || "Failed to fetch permissions");
      console.error("Permissions error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  // ✅ Memoize all the service methods
  const fetchUsers = useCallback(() => permissionService.fetchUsers(), []);
  const createPermission = useCallback((payload) => permissionService.createPermission(payload), []);
  const fetchAllRolePermissions = useCallback(() => permissionService.fetchAllRolePermissions(), []);
  const fetchSinglePermission = useCallback((id) => permissionService.fetchSinglePermission(id), []);
  const togglePermission = useCallback((id, key) => permissionService.togglePermission(id, key), []);
  const fetchPermissionsForUser = useCallback((id, role) => permissionService.fetchPermissionsForUser(id, role), []);

  return (
    <PermissionContext.Provider
      value={{
        // State
        permissions,
        loading,
        error,
        // Utility
        fetchPermissions,
        fetchUsers,
        createPermission,
        fetchAllRolePermissions,
        fetchSinglePermission,
        togglePermission,
        fetchPermissionsForUser,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissionContext = () => useContext(PermissionContext);
