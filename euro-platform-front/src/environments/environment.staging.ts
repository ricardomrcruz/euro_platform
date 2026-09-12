// Staging build (Vercel `stag` branch): frontend and backend are on separate origins, so
// /api/... calls are rewritten to this absolute URL -- the euro-platform-api Railway domain.
export const environment = {
  apiBaseUrl: 'https://euro-platform-api-production.up.railway.app',
};
