// src/utils/guestBlocker.ts
// Utility to detect and block guests indicated as VPN/proxy/rate limit
import { getApiEndpoint } from "./apiUtils";

export type GuestBlockResult = {
  blocked: boolean;
  reason: "vpn" | "rate-limit" | "forbidden" | null;
  message: string;
};

export async function checkGuestBlock(
  language: string,
): Promise<GuestBlockResult> {
  const endpoint = getApiEndpoint("guest-count");
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.REACT_APP_GUEST_API_KEY || "",
      },
      body: JSON.stringify({}),
    });
    let isRateLimited = false;
    if (res.status === 429) isRateLimited = true;
    // If status 403, block any message from backend
    if (res.status === 403) {
      let msg = "Access denied.";
      try {
        msg = await res.text();
      } catch {}
      return {
        blocked: true,
        reason: "forbidden",
        message:
          msg || (language === "en" ? "Access denied." : "Akses diblokir."),
      };
    }

    if (isRateLimited) {
      return {
        blocked: true,
        reason: "rate-limit",
        message:
          language === "en"
            ? "Access blocked: Too many requests from your IP. Please try again later."
            : "Akses diblokir: Terlalu banyak permintaan dari IP Anda. Silakan coba lagi nanti.",
      };
    }
    return { blocked: false, reason: null, message: "" };
  } catch {
    return { blocked: false, reason: null, message: "" };
  }
}
