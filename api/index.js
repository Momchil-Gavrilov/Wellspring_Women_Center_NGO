// ESM entry point for Vercel serverless functions.
// Uses createRequire to load the CommonJS Express app from the backend directory.
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
export default require('../backend/app');
