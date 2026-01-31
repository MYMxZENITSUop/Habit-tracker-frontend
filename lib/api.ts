export const API_BASE_URL = "https://fastapi-task-manager-w8k2.onrender.com";

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refresh_token");

  if (!refreshToken) throw new Error("No refresh token");

  const res = await fetch(`${API_BASE_URL}/users/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) throw new Error("Refresh failed");

  const data = await res.json();
  localStorage.setItem("access_token", data.access_token);

  return data.access_token;
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  let token = localStorage.getItem("access_token");

  let res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...(options.headers || {}),
    },
  });

  // 🔁 Handle expired access token
  if (res.status === 401) {
    try {
      token = await refreshAccessToken();

      res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(options.headers || {}),
        },
      });
    } catch {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.replace("/login");
      throw new Error("Session expired");
    }
  }

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "API request failed");
  }

  return res.json();
}
