import app from './app';
import { env } from './config/env';

const PORT = env.PORT;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 BodyFit AI Server running on port ${PORT}`);
  console.log(`📝 Environment: ${env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Network: http://0.0.0.0:${PORT}/health`);
});
