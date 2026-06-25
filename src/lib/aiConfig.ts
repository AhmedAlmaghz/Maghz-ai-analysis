// Centralized AI/Gemini configuration so the model name lives in ONE place.
// Previously the model name was hardcoded (and incorrect) in 3 separate files.

// Default Gemini model used across the app for analysis and chat.
// Valid Gemini model identifier. Use 'gemini-2.0-flash' for maximum capability
// or 'gemini-2.0-flash-lite' for the fastest/cheapest lite variant.
export const GEMINI_MODEL = 'gemini-3.1-flash-lite';

/**
 * Extract the first balanced JSON object from a raw model response.
 * Strips common markdown code fences and ignores any leading/trailing prose.
 * Returns null if no JSON object can be found.
 */
export function extractJsonObject(raw: string): string | null {
  if (!raw) return null;

  // Remove markdown code fences like ```json ... ``` or ``` ... ```
  const withoutFences = raw
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  // Find the first '{' and scan for its matching closing '}' (brace counting),
  // while ignoring braces that appear inside string literals.
  const start = withoutFences.indexOf('{');
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < withoutFences.length; i++) {
    const ch = withoutFences[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
    } else if (ch === '{') {
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0) {
        return withoutFences.slice(start, i + 1);
      }
    }
  }

  // Fallback: greedy match if brace counting failed (unbalanced output).
  const match = withoutFences.match(/\{[\s\S]*\}/);
  return match ? match[0] : null;
}

/**
 * Convert a raw Gemini/network error into a clear, user-facing Arabic message.
 */
export function friendlyAIError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err ?? '');
  const msg = raw.toLowerCase();

  if (msg.includes('api key') || msg.includes('api_key') || msg.includes('401') || msg.includes('permission')) {
    return 'مفتاح API غير صالح أو غير مصرّح به. تحقق من المفتاح في الإعدادات.';
  }
  if (msg.includes('429') || msg.includes('quota') || msg.includes('rate') || msg.includes('resource has been exhausted')) {
    return 'تم تجاوز حد الطلبات (Rate limit). انتظر قليلاً ثم حاول مجدداً.';
  }
  if (msg.includes('404') || msg.includes('not found') || msg.includes('model')) {
    return 'النموذج المحدد غير متاح. تحقق من اسم النموذج في الإعدادات.';
  }
  if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed to')) {
    return 'تعذّر الاتصال بخدمة الذكاء الاصطناعي. تحقق من اتصالك بالإنترنت.';
  }
  return raw || 'حدث خطأ غير متوقع أثناء الاتصال بالذكاء الاصطناعي.';
}

/**
 * Run an async AI call with automatic retries using exponential backoff.
 * Does NOT retry on auth (401/permission) errors since those won't recover.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { retries?: number; baseDelayMs?: number } = {}
): Promise<T> {
  const { retries = 2, baseDelayMs = 800 } = options;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();

      // Don't retry on auth/permission errors — they won't self-resolve.
      if (msg.includes('api key') || msg.includes('api_key') || msg.includes('401') || msg.includes('permission')) {
        break;
      }
      // No more attempts left.
      if (attempt === retries) break;

      const delay = baseDelayMs * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}


