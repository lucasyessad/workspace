/**
 * Protection CSRF via double-submit cookie.
 * Génère un token unique côté client, l'envoie en header + cookie.
 * Le serveur vérifie que les deux correspondent.
 */

const CSRF_HEADER = "x-csrf-token";
const CSRF_COOKIE = "csrf_token";

/** Génère un token CSRF aléatoire */
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Client: récupère ou crée un token CSRF et le stocke en cookie */
export function getClientCsrfToken(): string {
  if (typeof document === "undefined") return "";

  const existing = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${CSRF_COOKIE}=`))
    ?.split("=")[1];

  if (existing) return existing;

  const token = generateToken();
  document.cookie = `${CSRF_COOKIE}=${token}; path=/; SameSite=Strict; Secure`;
  return token;
}

/** Client: retourne les headers avec le token CSRF */
export function csrfHeaders(): Record<string, string> {
  return {
    [CSRF_HEADER]: getClientCsrfToken(),
  };
}

/** Serveur: vérifie le token CSRF */
export function verifyCsrfToken(request: Request): boolean {
  const headerToken = request.headers.get(CSRF_HEADER);
  const cookieHeader = request.headers.get("cookie") || "";
  const cookieToken = cookieHeader
    .split("; ")
    .find((c) => c.startsWith(`${CSRF_COOKIE}=`))
    ?.split("=")[1];

  if (!headerToken || !cookieToken) return false;
  return headerToken === cookieToken;
}
