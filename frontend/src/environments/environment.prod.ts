/**
 * Production build API URL.
 * For Docker Compose / local browser testing, the app calls the host machine's port 5000.
 * Before deploying frontend + backend to the cloud, change this to your real API origin (https://...).
 */
export const environment = {
  production: true,
  apiUrl: 'http://localhost:5000',
};
