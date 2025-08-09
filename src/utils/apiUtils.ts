// Utility to detect environment and provide appropriate endpoints
export const getApiEndpoint = (endpoint: string): string => {
  // Detect whether running in Vercel
  const isVercel =
    process.env.VERCEL === "1" ||
    window.location.hostname.includes("vercel.app");
  // If in Vercel, use /api routes
  if (isVercel) {
    // Get the endpoint name without Netlify path
    const endpointName = endpoint.replace("/.netlify/functions/", "");
    return `/api/${endpointName}`;
  }
  // If in Netlify or local development, use Netlify functions path
  return endpoint.startsWith("/.netlify")
    ? endpoint
    : `/.netlify/functions/${endpoint}`;
};
