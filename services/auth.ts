import { API_BASE_URL } from "@/lib/api";

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      username: email,
      password: password,
    }),
  });

  if (!res.ok) {
    throw new Error("Login failed");
  }

  return res.json();
}
