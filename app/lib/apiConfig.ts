export function getApiBaseUrl(): string {
  const url = process.env.API_URL ?? "http://localhost:4000";
  return url.replace(/\/+$/, "");
}
