// src/utils/api.ts

export const API_URL = "http://127.0.0.1:8000";  // backend base URL

export async function fetchMapSpots() {
  const res = await fetch(`${API_URL}/map`);
  if (!res.ok) throw new Error("Failed to fetch spots");
  return res.json();
}
