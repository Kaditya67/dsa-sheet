// Check if running on localhost to use local backend by default
const isLocal =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

const rawApiUrl =
  import.meta.env.API_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  (isLocal ? "http://localhost:5001" : "https://dsa-sheet-one.vercel.app");

// Normalize URL by removing any trailing slashes to prevent "//api/..." redirects
const API_URL = rawApiUrl.replace(/\/+$/, "");

const getAuthHeaders = () => {
  const token = localStorage.getItem("dsa_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Auth APIs
export const registerUser = async (name, email, password) => {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Registration failed");
  return data;
};

export const loginUser = async (email, password) => {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Invalid credentials");
  return data;
};

export const getProfile = async () => {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: { ...getAuthHeaders() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch profile");
  return data;
};

// Tag APIs
export const getTags = async () => {
  const res = await fetch(`${API_URL}/api/tags`, {
    headers: { ...getAuthHeaders() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch tags");
  return data;
};

export const createTag = async (name, parentGroup, color) => {
  const res = await fetch(`${API_URL}/api/tags`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ name, parentGroup, color }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create tag");
  return data;
};

export const deleteTag = async (id) => {
  const res = await fetch(`${API_URL}/api/tags/${id}`, {
    method: "DELETE",
    headers: { ...getAuthHeaders() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to delete tag");
  return data;
};

// Problem APIs
export const getProblems = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/api/problems?${query}`, {
    headers: { ...getAuthHeaders() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch problems");
  return data;
};

export const getProblemStats = async () => {
  const res = await fetch(`${API_URL}/api/problems/stats`, {
    headers: { ...getAuthHeaders() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch stats");
  return data;
};

export const createProblem = async (problemData) => {
  const res = await fetch(`${API_URL}/api/problems`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(problemData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create problem");
  return data;
};

export const updateProblem = async (id, problemData) => {
  const res = await fetch(`${API_URL}/api/problems/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(problemData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update problem");
  return data;
};

export const patchProblemStatus = async (id, status) => {
  const res = await fetch(`${API_URL}/api/problems/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update status");
  return data;
};

export const toggleFavorite = async (id) => {
  const res = await fetch(`${API_URL}/api/problems/${id}/toggle-favorite`, {
    method: "PATCH",
    headers: { ...getAuthHeaders() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to toggle bookmark");
  return data;
};

export const deleteProblem = async (id) => {
  const res = await fetch(`${API_URL}/api/problems/${id}`, {
    method: "DELETE",
    headers: { ...getAuthHeaders() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to delete problem");
  return data;
};
