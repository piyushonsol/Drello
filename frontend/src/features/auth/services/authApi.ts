import { apiRequest } from "../../../lib/api";

export const authApi = {
  login: (username: string, email: string, password: string) =>
    apiRequest<{ token: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        username: username || undefined,
        email: email || undefined,
        password,
      }),
    }),
  signup: (username: string, email: string, password: string) =>
    apiRequest<{ message: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    }),
};
