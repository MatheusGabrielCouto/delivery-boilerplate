const DEFAULT_OPTIONS = {
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "Lax" as const,
};

function serialize(name: string, value: string, options = DEFAULT_OPTIONS): string {
  const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];
  parts.push(`path=${options.path}`);
  parts.push(`max-age=${options.maxAge}`);
  parts.push(`samesite=${options.sameSite}`);
  if (typeof window !== "undefined" && window.location?.protocol === "https:") {
    parts.push("secure");
  }
  return parts.join("; ");
}

export function getCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/([.*+?^${}()|[\]\\])/g, "\\$1")}=([^;]*)`));
  const value = match ? decodeURIComponent(match[1]) : "";
  return value ?? "";
}

export function setCookie(name: string, value: string, options = DEFAULT_OPTIONS): void {
  if (typeof document === "undefined") return;
  document.cookie = serialize(name, value, options);
}

export function removeCookie(name: string): void {
  setCookie(name, "", { ...DEFAULT_OPTIONS, maxAge: 0 });
}
