// Security utilities for input validation and sanitization
export class SecurityUtils {
  // Enhanced blacklist with more comprehensive coverage
  private static readonly BLACKLIST_PATTERNS = [
    // Profanity & inappropriate content
    /\b(anjing|babi|bangsat|kontol|memek|asu|tolol|goblok|fuck|shit|damn|hell)\b/gi,

    // Potential XSS attempts
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,

    // SQL injection attempts
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
    /(--|\*\/|\/\*)/g,

    // URL/Link spam
    /(https?:\/\/[^\s]+)/gi,
    /(www\.[^\s]+)/gi,
    /(\b\w+\.(com|net|org|xyz|tk|ml|ga|cf|info|biz)\b)/gi,

    // Email harvesting
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,

    // Phone number spam (basic patterns)
    /(\+?\d{1,4}[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})/g,

    // Crypto/gambling spam
    /\b(bitcoin|crypto|slot|casino|judi|poker|gambling|jackpot)\b/gi,

    // Excessive repetition (same char repeated 5+ times)
    /(.)\1{4,}/g,

    // HTML tags
    /<[^>]*>/g,
  ];

  // Validate and sanitize name input
  static validateName(name: string): {
    isValid: boolean;
    error?: string;
    sanitized: string;
  } {
    if (!name || typeof name !== "string") {
      return {
        isValid: false,
        error: "Nama tidak boleh kosong.",
        sanitized: "",
      };
    }

    const trimmed = name.trim();

    if (trimmed.length === 0) {
      return {
        isValid: false,
        error: "Nama tidak boleh kosong.",
        sanitized: "",
      };
    }

    if (trimmed.length > 50) {
      return {
        isValid: false,
        error: "Nama terlalu panjang (maksimal 50 karakter).",
        sanitized: trimmed,
      };
    }

    if (trimmed.length < 2) {
      return {
        isValid: false,
        error: "Nama terlalu pendek (minimal 2 karakter).",
        sanitized: trimmed,
      };
    }

    // Check for malicious patterns
    for (const pattern of this.BLACKLIST_PATTERNS) {
      if (pattern.test(trimmed)) {
        return {
          isValid: false,
          error: "Nama mengandung karakter atau kata yang tidak diperbolehkan.",
          sanitized: trimmed,
        };
      }
    }

    // Only allow letters, spaces, dots, commas, apostrophes, and hyphens
    const namePattern = /^[a-zA-Z\s.,'-]+$/;
    if (!namePattern.test(trimmed)) {
      return {
        isValid: false,
        error:
          "Nama hanya boleh mengandung huruf, spasi, titik, koma, tanda kutip, dan tanda hubung.",
        sanitized: trimmed,
      };
    }

    // Check for suspicious patterns (all caps, excessive punctuation)
    if (trimmed === trimmed.toUpperCase() && trimmed.length > 10) {
      return {
        isValid: false,
        error: "Mohon gunakan kapitalisasi yang wajar.",
        sanitized: trimmed,
      };
    }

    const sanitized = this.sanitizeInput(trimmed);
    return { isValid: true, sanitized };
  }

  // Validate and sanitize message input
  static validateMessage(message: string): {
    isValid: boolean;
    error?: string;
    sanitized: string;
  } {
    if (!message || typeof message !== "string") {
      return {
        isValid: false,
        error: "Pesan tidak boleh kosong.",
        sanitized: "",
      };
    }

    const trimmed = message.trim();

    if (trimmed.length === 0) {
      return {
        isValid: false,
        error: "Pesan tidak boleh kosong.",
        sanitized: "",
      };
    }

    if (trimmed.length > 300) {
      return {
        isValid: false,
        error: "Pesan terlalu panjang (maksimal 300 karakter).",
        sanitized: trimmed,
      };
    }

    if (trimmed.length < 5) {
      return {
        isValid: false,
        error: "Pesan terlalu pendek (minimal 5 karakter).",
        sanitized: trimmed,
      };
    }

    // Check for malicious patterns
    for (const pattern of this.BLACKLIST_PATTERNS) {
      if (pattern.test(trimmed)) {
        return {
          isValid: false,
          error: "Pesan mengandung konten yang tidak diperbolehkan.",
          sanitized: trimmed,
        };
      }
    }

    // Check for spam indicators
    if (this.isSpamMessage(trimmed)) {
      return {
        isValid: false,
        error: "Pesan terdeteksi sebagai spam.",
        sanitized: trimmed,
      };
    }

    const sanitized = this.sanitizeInput(trimmed);
    return { isValid: true, sanitized };
  }

  // Basic sanitization
  private static sanitizeInput(input: string): string {
    return input
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;")
      .trim();
  }

  // Check for spam patterns
  private static isSpamMessage(message: string): boolean {
    const lowerMessage = message.toLowerCase();

    // Check for excessive caps (more than 70% uppercase)
    const capsCount = (message.match(/[A-Z]/g) || []).length;
    const totalLetters = (message.match(/[A-Za-z]/g) || []).length;
    if (totalLetters > 10 && capsCount / totalLetters > 0.7) {
      return true;
    }

    // Check for excessive punctuation
    const punctCount = (message.match(/[!?.,;:]/g) || []).length;
    if (punctCount > message.length * 0.3) {
      return true;
    }

    // Check for repeated words
    const words = lowerMessage.split(/\s+/);
    const wordCount = new Map<string, number>();
    for (const word of words) {
      if (word.length > 2) {
        wordCount.set(word, (wordCount.get(word) || 0) + 1);
        if (wordCount.get(word)! > 3) {
          return true; // Same word repeated more than 3 times
        }
      }
    }

    return false;
  }

  // Validate environment variables
  static validateEnvVars(): { isValid: boolean; missing: string[] } {
    const required = [
      "REACT_APP_RECAPTCHA_SITE_KEY",
      "REACT_APP_GUEST_API_KEY",
    ];

    const missing = required.filter((key) => !process.env[key]);
    return { isValid: missing.length === 0, missing };
  }

  // Rate limiting check (client-side)
  static checkRateLimit(
    key: string,
    maxAttempts: number = 3,
    windowMs: number = 10 * 60 * 1000,
  ): boolean {
    const now = Date.now();
    const storageKey = `rl_${key}`;

    try {
      const stored = localStorage.getItem(storageKey);
      const attempts = stored ? JSON.parse(stored) : [];

      // Remove old attempts outside the window
      const validAttempts = attempts.filter(
        (timestamp: number) => now - timestamp < windowMs,
      );

      if (validAttempts.length >= maxAttempts) {
        return false; // Rate limited
      }

      // Add current attempt
      validAttempts.push(now);
      localStorage.setItem(storageKey, JSON.stringify(validAttempts));

      return true; // Allow request
    } catch (error) {
      console.warn("Rate limiting check failed:", error);
      return true; // Allow request if localStorage fails
    }
  }
}

// Escape function for Discord/Telegram markdown
export function escapeMarkdown(text: string): string {
  if (!text) return "";
  return text.replace(/([_*[\]()~`>#+\-=|{}.!\\])/g, "\\$1");
}

// Generate secure random token
export function generateSecureToken(length: number = 32): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const crypto = window.crypto || (window as any).msCrypto;

  if (crypto && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
  } else {
    // Fallback for older browsers
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }

  return result;
}
