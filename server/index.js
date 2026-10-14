import app from './app.js';
import { initializeDatabase } from './database/initDb.js';

const PORT = process.env.PORT || 5000;

// Initialize database schema and seeds before listening
initializeDatabase();

app.listen(PORT, () => {
  console.log(`========================================================`);
  console.log(`🚀 University Fund Management & AI Validation System`);
  console.log(`🏛️ Department of Higher Education, Govt of Karnataka`);
  console.log(`📡 Backend API Server running at http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`========================================================`);
});
