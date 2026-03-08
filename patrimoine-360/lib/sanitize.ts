/**
 * Sanitization et validation des entrées utilisateur.
 * Protection contre XSS, injection HTML et prompt injection.
 */

// === XSS Protection ===

/** Échappe les caractères HTML dangereux */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/** Supprime les balises HTML/script d'une chaîne */
export function stripHtml(str: string): string {
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/on\w+\s*=/gi, "");
}

/** Supprime les URLs javascript: et data: */
export function stripDangerousUrls(str: string): string {
  return str
    .replace(/javascript\s*:/gi, "")
    .replace(/data\s*:[^,]*base64/gi, "");
}

// === Prompt Injection Protection ===

/** Patterns connus de prompt injection */
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /ignore\s+(all\s+)?above\s+instructions/i,
  /disregard\s+(all\s+)?previous/i,
  /forget\s+(all\s+)?previous/i,
  /you\s+are\s+now\s+a/i,
  /new\s+instructions?\s*:/i,
  /system\s*:\s*/i,
  /\[INST\]/i,
  /\[\/INST\]/i,
  /<\|im_start\|>/i,
  /<\|im_end\|>/i,
  /\{\{.*system.*\}\}/i,
  /pretend\s+you\s+are/i,
  /act\s+as\s+if\s+you/i,
  /override\s+(your|the)\s+(system|instructions)/i,
];

/** Détecte les tentatives de prompt injection */
export function detectPromptInjection(input: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(input));
}

/** Nettoie une entrée utilisateur pour la rendre safe dans un prompt */
export function sanitizeForPrompt(input: string): string {
  let cleaned = stripHtml(input);
  cleaned = stripDangerousUrls(cleaned);
  // Limiter la longueur pour éviter les attaques par volume
  if (cleaned.length > 10000) {
    cleaned = cleaned.substring(0, 10000);
  }
  return cleaned.trim();
}

// === Input Validation ===

/** Valide un email basique */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

/** Valide une valeur numérique dans une plage */
export function isValidNumber(value: unknown, min = -1e15, max = 1e15): boolean {
  const n = Number(value);
  return !isNaN(n) && isFinite(n) && n >= min && n <= max;
}

/** Valide un moduleId */
export function isValidModuleId(id: unknown): boolean {
  const n = Number(id);
  return Number.isInteger(n) && n >= 1 && n <= 12;
}

/** Sanitize un objet FormData complet */
export function sanitizeFormData(data: Record<string, unknown>): Record<string, string | number> {
  const sanitized: Record<string, string | number> = {};

  for (const [key, value] of Object.entries(data)) {
    // Clé : alphanumeric + underscore only
    const safeKey = key.replace(/[^a-zA-Z0-9_]/g, "");
    if (!safeKey || safeKey.length > 50) continue;

    if (typeof value === "number") {
      if (isValidNumber(value)) {
        sanitized[safeKey] = value;
      }
    } else if (typeof value === "string") {
      sanitized[safeKey] = sanitizeForPrompt(value);
    }
    // Ignore other types
  }

  return sanitized;
}

/** Sanitize les messages du chat */
export function sanitizeChatMessage(content: string): { safe: boolean; cleaned: string; injectionDetected: boolean } {
  const injectionDetected = detectPromptInjection(content);
  let cleaned = stripHtml(content);
  cleaned = stripDangerousUrls(cleaned);

  // Limiter longueur message
  if (cleaned.length > 5000) {
    cleaned = cleaned.substring(0, 5000);
  }

  return {
    safe: !injectionDetected,
    cleaned: cleaned.trim(),
    injectionDetected,
  };
}
