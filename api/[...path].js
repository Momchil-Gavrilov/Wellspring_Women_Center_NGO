// Catch-all serverless function for all /api/* routes.
// Vercel routes /api/shipments, /api/catalog, /api/pricing, etc. here automatically.
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
export default require('../backend/app');
