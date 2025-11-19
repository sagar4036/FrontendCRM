// src/services/permissionService.js
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const getToken = () => localStorage.getItem("token");
const getHeaders = () => ({
  "x-company-id": "0aa80c0b-0999-4d79-8980-e945b4ea700d",
  Authorization: `Bearer ${getToken()}`,
  "Content-Type": "application/json",
});

export const permissionService = {
  async fetchUsers() {
    const res = await axios.get(`${BASE_URL}/get-managers-users`, { headers: getHeaders() });
    return res.data;
  },

  async createPermission(payload) {
    const res = await axios.post(`${BASE_URL}/create`, payload, { headers: getHeaders() });
    return res.data;
  },

  async fetchAllRolePermissions() {
    const res = await axios.get(`${BASE_URL}/get-permissions`, { headers: getHeaders() });
    return res.data;
  },

  async fetchSinglePermission(id) {
    const res = await axios.get(`${BASE_URL}/permission/${id}`, { headers: getHeaders() });
    return res.data;
  },

  async togglePermission(permissionId, permissionKey) {
    const res = await axios.patch(`${BASE_URL}/${permissionId}/toggle`, { permissionKey }, {
      headers: getHeaders(),
    });
    return res.data;
  },

  async fetchPermissionsForUser(userId, role) {
    const res = await axios.get(`${BASE_URL}/${role}/${userId}`, { headers: getHeaders() });
    return res.data;
  },
};
